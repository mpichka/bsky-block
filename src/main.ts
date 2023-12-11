import 'dotenv/config';
import { BskyClient } from './bsky/client';
import { DBConnection } from './sequelize/connection';
import { ActorsService } from './services/actors.service';
import { PostsService } from './services/posts.service';
import { Logger } from './utils/logger';

(async function main() {
  const logger = new Logger('App');
  logger.log('startup app');

  logger.setStart();
  const dbConnection = DBConnection.connect();
  await dbConnection.sync();

  const client = new BskyClient();

  await client
    .setCredentials(process.env.BSKY_IDENTIFIER!, process.env.BSKY_PASSWORD!)
    .createSession();

  const actorsService = new ActorsService(dbConnection, client);
  await actorsService.saveProfile(process.env.STARTING_ACTOR!);
  logger.log('initialization starting actor');

  logger.setStart();
  await actorsService.syncActors();
  logger.log('completed syncing actors');

  const postsService = new PostsService(dbConnection, client);

  logger.setStart();
  await postsService.syncPosts();
  logger.log('completed syncing posts');

  logger.clearTimer();
  logger.log('closing app');
  await dbConnection.close();
})();
