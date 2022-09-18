import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "./user.entity";

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