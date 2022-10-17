import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class ChannelMessage {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	sender: User;

	@Column()
	content: string;

	@CreateDateColumn()
	send_at: Date;

	@ManyToOne(() => Channel, (channel) => channel.messages, { onDelete: 'CASCADE' })
	channel: Channel;
}