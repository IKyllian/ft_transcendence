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

	@ManyToOne(() => User, { orphanedRowAction: 'delete' })
	addressee: User;

	@ManyToOne(() => User, { orphanedRowAction: 'delete' })
	requester: User;

	@ManyToOne(() => Channel, { orphanedRowAction: 'delete' })
	channel: Channel;

	@ManyToOne(() => Conversation, { orphanedRowAction: 'delete' })
	conversation: Conversation;

	@Column({ nullable: true, type: 'timestamptz' })
	delete_at?: Date;
}