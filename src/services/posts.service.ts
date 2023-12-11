import { DateTime } from 'luxon';
import type { Repository, Sequelize } from 'sequelize-typescript';
import type { BskyClient } from '../bsky/client';
import { Feeds } from '../bsky/types/feeds';
import { Actor } from '../sequelize/models/actor.model';
import { Post } from '../sequelize/models/post.model';
import { Logger } from '../utils/logger';

export class PostsService {
  private readonly actorRepository: Repository<Actor>;
  private readonly postRepository: Repository<Post>;
  constructor(
    private readonly db: Sequelize,
    private readonly bskyClient: BskyClient,
  ) {
    this.actorRepository = this.db.getRepository(Actor);
    this.postRepository = this.db.getRepository(Post);
  }

  async syncPosts() {
    const totalLogger = new Logger('PostsService');
    const logger = new Logger('PostsService');
    let actors: Actor[];
    let totalCount = 0;

    totalLogger.setStart();
    do {
      logger.setStart();
      actors = await this.actorRepository
        .scope(['notSyncedPosts'])
        .findAll({ limit: 10 });

      for (const actor of actors) {
        const posts = await this.bskyClient.getAuthorFeeds(actor.handle);
        const mappedPosts: Partial<Post>[] = this.mapPosts(posts, actor.id);
        if (mappedPosts.length) {
          await this.postRepository.bulkCreate(mappedPosts as any, {
            ignoreDuplicates: true, // TODO: should update rows, not ignore them
          });
        }
        totalCount += mappedPosts.length;
        await actor.update({
          syncedPostsAt: DateTime.now().toJSDate(),
        });

        logger.log(`synced posts: ${mappedPosts.length}`);
      }
    } while (actors.length);

    totalLogger.log(`total posts was synced: ${totalCount}`);
  }

  mapPosts(posts: Feeds, authorId: number) {
    const mappedPosts = [];

    for (const feed of posts.feed) {
      const post = feed?.post;
      if (!post) continue;

      mappedPosts.push({
        authorId,
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        likeCount: post.likeCount,
        text: post.record.text,
        langs: post.record.langs,
        uri: post.uri,
      });
    }

    return mappedPosts;
  }
}
