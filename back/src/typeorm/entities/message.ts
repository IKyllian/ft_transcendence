import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	sender: User;

	@Column()
	content: string;

	@CreateDateColumn()
	send_at: Date;

	@ManyToOne(() => Channel, (channel) => channel.messages)
	// @JoinColumn()
	channel: Channel;
}