import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class MutedUser {
	@PrimaryGeneratedColumn()
	id: number;

	@RelationId("user")
	userId: number;

	@ManyToOne(() => User, {
		orphanedRowAction: 'delete',
	})
	user: User;

	@RelationId("channel")
	channelId: number;

	@ManyToOne(() => Channel, {
		orphanedRowAction: 'delete',
	})
	channel: Channel;

	@Column({ nullable: true })
	until?: Date;
}