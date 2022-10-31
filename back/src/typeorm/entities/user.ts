
import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne, BaseEntity } from "typeorm";
import { Avatar } from "./avatar";
import { ChannelUser } from "./channelUser";
import { Conversation } from "./conversation";
import { Friendship } from "./friendship";
import { Statistic } from "./statistic";

export type userStatus = 'online' | 'offline' | 'in_game';

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	@Exclude()
	id42?: number;

	@Column({ unique: true, nullable: true })
	username: string;

	@Column({ default: 'offline' })
	status: userStatus;

	@Column({ nullable: true })
	avatar?: string;

	@OneToOne(() => Statistic, (statistic) => statistic.user, {
		cascade: true,
	})
	statistic: Statistic;

	@OneToMany(() => ChannelUser, (channelUser) => channelUser.user)
	channelUser: ChannelUser[];

	@ManyToMany(() => User)
	@JoinTable({ name: 'blocked_users' })
	blocked: User[];

	@Exclude()
	@Column({ nullable: true, select: false })
	hash?: string

	@Exclude()
	@Column({ nullable: true, select: false })
	refresh_hash?: string

	@Column({ nullable: true })
	two_factor_secret?: string

	@Column({ default: false })
	two_factor_enabled: boolean;
} 
