import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class BannedUser {
	@PrimaryGeneratedColumn()
	id: number;

	@RelationId('user')
	userId: number;

	@ManyToOne(() => User, {
		orphanedRowAction: 'delete',
	})
	user: User;

	@RelationId('channel')
	channelId: number;

	@ManyToOne(() => Channel, (channel) => channel.bannedUsers, {
		orphanedRowAction: 'delete',
	})
	channel: Channel;

	@Column({ nullable: true })
	until?: Date;
}