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

    return await this.actorRepository.upsert(profile as any);
  }

  private async saveActor(actor: BskyActor) {
    return await this.actorRepository.upsert(actor as any);
  }

  private async dropOldFollowings(followerId: number) {
    await this.followerRepository.destroy({ where: { followerId } });
  }

  private async dropOldFollowers(actorId: number) {
    await this.followerRepository.destroy({ where: { actorId } });
  }

  private async saveFollower(actorId: number, followerId: number) {
    if (!actorId || !followerId) return;
    await this.followerRepository.upsert({ actorId, followerId });
  }

  async syncActors() {
    const totalLogger = new Logger('ActorsService');
    const logger = new Logger('ActorsService');
    let actors: Actor[];
    let totalCount = 0;

    totalLogger.setStart();
    do {
      logger.setStart();
      actors = await this.actorRepository
        .scope(['notSynced'])
        .findAll({ limit: 10 });

      await Promise.all(
        actors.map(async (actor) => {
          await Promise.all([
            this.syncFollowers(actor),
            this.syncFollows(actor),
          ]);
          await actor.update({
            syncedProfileAt: DateTime.now().toJSDate(),
          });
        }),
      );

      totalCount += actors.length;
      logger.log(`synced actors: ${actors.length}`);
    } while (actors.length);

    totalLogger.log(`total actors was synced: ${totalCount}`);
  }

  async syncFollowers(actor: Actor) {
    let res: Followers;
    let cursor: string | undefined = undefined;
    await this.dropOldFollowers(actor.id);

    do {
      res = await this.bskyClient.getFollowers(actor.handle, cursor);

      await Promise.all(
        res.followers.map(async (follower) => {
          const [profile] = await this.saveActor(follower);
          await this.saveFollower(actor.id, profile.id);
        }),
      );

      cursor = res?.cursor;
    } while (res.followers.length);
  }

  async syncFollows(actor: Actor) {
    let res: Follows;
    let cursor: string | undefined = undefined;
    await this.dropOldFollowings(actor.id);

    do {
      res = await this.bskyClient.getFollows(actor.handle, cursor);

      await Promise.all(
        res.follows.map(async (follower) => {
          const [profile] = await this.saveActor(follower);
          await this.saveFollower(profile.id, actor.id);
        }),
      );

      cursor = res?.cursor;
    } while (res.follows.length);
  }
}
