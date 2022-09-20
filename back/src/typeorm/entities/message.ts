import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	// @JoinColumn()
	// @ManyToOne(() => User)
	// sender: User;

	@Column()
	sender: string;

	@Column()
	content: string;

	@CreateDateColumn()
	send_at: Date;

	@ManyToOne(() => Channel, (channel) => channel.messages)
	@JoinColumn()
	channel: Channel
}