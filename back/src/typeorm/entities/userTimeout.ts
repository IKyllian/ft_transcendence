import { TimeoutType } from "src/utils/types/types";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class UserTimeout {
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

	@ManyToOne(() => Channel, (channel) => channel.usersTimeout, {
		orphanedRowAction: 'delete',
	})
	channel: Channel;

	@Column()
	type: TimeoutType;

	@Column({ nullable: true, type: 'timestamptz' })
	until?: Date;
}