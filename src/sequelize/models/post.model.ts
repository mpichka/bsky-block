import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Actor } from './actor.model';

@Table({
  deletedAt: false,
  updatedAt: false,
  timestamps: false,
})
export class Post extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @CreatedAt
  createdAt: Date;

  @ForeignKey(() => Actor)
  @Column(DataType.INTEGER)
  authorId: number;

  @Column(DataType.INTEGER)
  replyCount: number;

  @Column(DataType.INTEGER)
  repostCount: number;

  @Column(DataType.INTEGER)
  likeCount: number;

  @Column(DataType.TEXT)
  text: string;

  @Column(DataType.ARRAY(DataType.STRING))
  langs: string[];

  @Unique
  @Column(DataType.STRING)
  uri: string;
}
