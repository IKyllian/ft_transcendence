import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation";
import { User } from "./user";

@Entity()
export class PrivateMessage {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	sender: User;

	@Column()
	content: string;

	@CreateDateColumn({ type: 'timestamptz' })
	send_at: Date;

	@ManyToOne(() => Conversation, (conv) => conv.messages, {
		onDelete: 'CASCADE'
	})
	conversation: Conversation;
}