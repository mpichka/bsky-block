import type { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Actor } from './models/actor.model';
import { Follower } from './models/follower.model';
import { Post } from './models/post.model';

export class DBConnection {
  static connect(): Sequelize {
    const sequelize = new Sequelize({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      dialect: process.env.DB_DIALECT as Dialect,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      repositoryMode: true,
      models: [Actor, Follower, Post],
      logging: false,
      pool: {
        max: 50,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    });

    return sequelize;
  }
}
