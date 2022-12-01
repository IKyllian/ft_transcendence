
import { Exclude } from "class-transformer";
import { UserStatus } from "src/utils/types/types";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne, BaseEntity, CreateDateColumn } from "typeorm";
import { Avatar } from "./avatar";
import { ChannelUser } from "./channelUser";
import { Conversation } from "./conversation";
import { Friendship } from "./friendship";
import { MatchResult } from "./matchResult";
import { Statistic } from "./statistic";
import { UserAccount } from "./userAccount";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	id42?: number;

	@Column({ unique: true, nullable: true })
	username: string;

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
	status: UserStatus;

	@Column({ unique: true })
  	email: string;

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

	@Column({ default: 1000 })
	singles_elo: number;

	@Column({ default: 1000 })
	doubles_elo: number;

	@OneToOne(() => UserAccount, (account) => account.user, { cascade: true })
	account: UserAccount;

	@Column({ default: false })
	two_factor_enabled: boolean;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at: Date;
} 
