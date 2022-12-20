
import { UserStatus } from "src/utils/types/types";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { ChannelUser } from "./channelUser";
import { Statistic } from "./statistic";
import { UserAccount } from "./userAccount";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, nullable: true })
	username: string;

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
	status: UserStatus;

	@Column({ unique: true, select: false })
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

	@Column({ default: null, nullable: true })
	in_game_id: string;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at: Date;
} 
