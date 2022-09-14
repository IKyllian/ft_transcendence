import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelMessage } from "./channelMsg.entity";
import { User } from "./user.entity";

type channelStatus = 'public' | 'private';

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	status: channelStatus;

	@Column({ default: false })
	protected: boolean;

	@ManyToMany(() => User, {
		nullable: true
	})
	@JoinTable({ name: 'user_in_channel'})
	users: User[]

	@OneToMany(() => ChannelMessage, (message) => message.channel, {
		nullable: true
	})
	messages: ChannelMessage[];

}