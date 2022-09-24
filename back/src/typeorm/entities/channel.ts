import { ChannelDto } from "src/chat/dto/channel.dto";
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, Unique } from "typeorm";
import { ChannelUser } from "./channelUser";
import { Message } from "./message";
import { User } from "./user";

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

	@OneToMany(() => ChannelUser, (users) => users.channel, { cascade: true })
	users?: ChannelUser[];

	@OneToMany(() => Message, (message) => message.id, {
		// nullable: true,
		// FAUT LIRE LA DOC SUR CASCADE, LAZY, recherche d'un objet dans un tableau LA, HOW GUARDS WORKS etc
		cascade: ['insert', 'remove'],
		// onDelete: "CASCADE",
	})
	messages: Message[];

	@ManyToMany(() => User, { cascade: true })
	@JoinTable({ name: 'user_banned' })
	bannedUsers?: User[];
}