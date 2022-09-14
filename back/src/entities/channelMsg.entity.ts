import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

@Entity()
export class ChannelMessage {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (sender) => sender.id)
	@JoinColumn()
	sender: User;

	@CreateDateColumn()
	send_at: Date;

	@Column()
	content: string;

	@ManyToOne(() => Channel, (channel) => channel.messages)
	@JoinColumn()
	channel: Channel
}