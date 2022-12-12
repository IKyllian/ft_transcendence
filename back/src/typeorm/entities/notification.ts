import { notificationType } from "src/utils/types/types";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "..";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: notificationType;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	addressee: User;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	requester: User;

	@ManyToOne(() => Channel, { onDelete: 'CASCADE' })
	channel: Channel;

	@ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
	conversation: Conversation;

	@Column({ nullable: true, type: 'timestamptz' })
	delete_at?: Date;
}