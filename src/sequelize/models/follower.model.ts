import { DataTypes } from 'sequelize';
import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Actor } from './actor.model';

@Table({
  deletedAt: false,
  updatedAt: false,
  createdAt: false,
  timestamps: false,
})
export class Follower extends Model {
  @ForeignKey(() => Actor)
  @PrimaryKey
  @Column({
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  actorId: number;

  @ForeignKey(() => Actor)
  @PrimaryKey
  @Column({
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  followerId: number;
}
