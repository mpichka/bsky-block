import { DateTime } from 'luxon';
import { Op } from 'sequelize';
import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';

@Scopes(() => ({
  notSynced: () => ({
    where: {
      [Op.or]: [
        { syncedProfileAt: null },
        {
          syncedProfileAt: {
            [Op.lt]: DateTime.now().minus({ day: 1 }).toJSDate(),
          },
        },
      ],
    },
  }),
  notSyncedPosts: () => ({
    where: {
      [Op.or]: [
        { syncedPostsAt: null },
        {
          syncedPostsAt: {
            [Op.lt]: DateTime.now().minus({ month: 1 }).toJSDate(),
          },
        },
      ],
    },
  }),
}))
@Table({
  deletedAt: false,
  updatedAt: false,
  timestamps: false,
})
export class Actor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @CreatedAt
  createdAt: Date;

  @Column(DataType.STRING)
  did: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  handle: string;

  @Column(DataType.STRING)
  displayName: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  avatar: string;

  @Column(DataType.TEXT)
  banner: string;

  @Column(DataType.STRING)
  lang: string;

  // 0 - target actor
  // 1 - actors that target actor follows
  // 2 - actors that users from level 1 follows
  @Column(DataType.INTEGER)
  level: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  syncedProfileAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  syncedPostsAt: Date;
}
