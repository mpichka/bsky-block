import { DateTime } from 'luxon';
import type { Repository, Sequelize } from 'sequelize-typescript';
import type { BskyClient } from '../bsky/client';
import {
  Actor as BskyActor,
  Followers,
  Follows,
} from '../bsky/types/followers';
import { Actor } from '../sequelize/models/actor.model';
import { Follower } from '../sequelize/models/follower.model';
import { Logger } from '../utils/logger';
import { PromisePool } from '../utils/promise_pool';

export class ActorsService {
  private readonly actorRepository: Repository<Actor>;
  private readonly followerRepository: Repository<Follower>;
  constructor(
    private readonly db: Sequelize,
    private readonly bskyClient: BskyClient,
  ) {
    this.actorRepository = this.db.getRepository(Actor);
    this.followerRepository = this.db.getRepository(Follower);
  }

  async saveProfile(handle: string) {
    const profile = await this.bskyClient.getProfile(handle);

    return await this.actorRepository.upsert({
      ...(profile as any),
      level: 0,
    });
  }

  private async dropOldFollowings(followerId: number) {
    await this.followerRepository.destroy({ where: { followerId } });
  }

  private async dropOldFollowers(actorId: number) {
    await this.followerRepository.destroy({ where: { actorId } });
  }

  /**
   * Bulk save followers and create relations between actor and followers in 3 queries
   */
  private async saveFollowers(actor: Actor, followers: BskyActor[]) {
    if (!followers.length) return;

    // Sort followers by handle to prevent deadlocks
    followers.sort((a, b) => a.handle.localeCompare(b.handle));
    await this.actorRepository.bulkCreate(
      followers.map((follower) => ({
        ...follower,
        level: actor.level + 1,
      })),
      {
        ignoreDuplicates: true,
      },
    );

    const actors = await this.actorRepository.findAll({
      where: { handle: followers.map((follower) => follower.handle) },
      attributes: ['id'],
    });

    await this.followerRepository.bulkCreate(
      actors.map((record) => ({
        actorId: actor.id,
        followerId: record.id,
      })),
      {
        ignoreDuplicates: true,
      },
    );
  }

  async syncActor(actor: Actor) {
    await this.syncFollowers(actor);
    await this.syncFollows(actor);
    await actor.update({
      syncedProfileAt: DateTime.now().toJSDate(),
    });
  }

  async syncActors() {
    const totalLogger = new Logger('ActorsService');
    const logger = new Logger('ActorsService');

    let totalCount = 0;
    let level = 0;
    const maxLevel = 2;

    const promisePool = new PromisePool({ concurrency: 5 });

    totalLogger.setStart();
    logger.setStart();
    for (;;) {
      // If we reached max level, stop syncing
      if (level >= maxLevel) {
        console.log('Max level reached');
        break;
      }

      const actors = await this.actorRepository
        .scope(['notSynced'])
        .findAll({ limit: 100, where: { level } });

      // If there are no actors on this level, go to the next level
      if (!actors.length) {
        level++;
        logger.log(`level ${level} was synced`);
        continue;
      }

      for (const actor of actors) {
        // this promise will resolve only when there are less
        // than 5 promises in the pool, otherwise it will wait
        // for the fastest promise to resolve
        await promisePool.add(async () => {
          await this.syncActor(actor);

          // Log every 10 actors to track progress
          totalCount++;
          if (totalCount % 10 === 0) {
            logger.log(`synced actors: ${totalCount}`);
            logger.clearTimer();
            logger.setStart();
          }
        });
      }
    }

    totalLogger.log(`total actors was synced: ${totalCount}`);
  }

  async syncFollowers(actor: Actor) {
    let res: Followers;
    let cursor: string | undefined = undefined;
    await this.dropOldFollowers(actor.id);

    do {
      res = await this.bskyClient.getFollowers(actor.handle, cursor);

      await this.saveFollowers(actor, res.followers);

      cursor = res?.cursor;
    } while (res.followers.length);
  }

  async syncFollows(actor: Actor) {
    let res: Follows;
    let cursor: string | undefined = undefined;
    await this.dropOldFollowings(actor.id);

    do {
      res = await this.bskyClient.getFollows(actor.handle, cursor);

      await this.saveFollowers(actor, res.follows);

      cursor = res?.cursor;
    } while (res.follows.length);
  }
}
