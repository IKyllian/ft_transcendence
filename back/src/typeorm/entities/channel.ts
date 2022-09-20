import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, Unique } from "typeorm";
import { Message } from "./message";
import { UserInChannel } from "./userInChannel";

export type channelOption = 'public' | 'private' | 'protected';

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	option: channelOption;

	@Column({ default: 0 })
	nb: number;

	// @ManyToMany(() => User, { nullable: true })
	// @JoinTable({ name: 'user_in_channel' })
	// users: User[];

	@OneToMany(() => UserInChannel, (users) => users.channel)
	users?: UserInChannel[];

	@OneToMany(() => Message, (message) => message.id, {
		nullable: true,
	})
	messages: Message[];
}