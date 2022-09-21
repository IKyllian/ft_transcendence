import { ChannelDto } from "src/chat/dto/channel.dto";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, Unique } from "typeorm";
import { Message } from "./message";
import { UserInChannel } from "./userInChannel";

export type channelOption = 'public' | 'private' | 'protected';

@Entity()
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ default: 'public' })
	option: channelOption;

	@Column({ default: 0 })
	nb: number;

	@OneToMany(() => UserInChannel, (users) => users.channel, {cascade: true})
	users?: Promise<UserInChannel[]>;

	@OneToMany(() => Message, (message) => message.id, {
		nullable: true,
		cascade: ['insert', 'remove']
	})
	messages: Message[];
}