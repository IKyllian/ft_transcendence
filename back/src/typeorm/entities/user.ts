
import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne, BaseEntity } from "typeorm";
import { Avatar } from "./avatar";
import { Channel } from "./channel";
import { Friendship } from "./friendship";
import { Statistic } from "./statistic";

export type userStatus = 'online' | 'offline' | 'in_game';

@Entity()
export class User extends BaseEntity {

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
	
	@OneToOne(() => Statistic, (statistic) => statistic.user, { cascade: true, eager: true, onDelete: 'CASCADE' })
	statistic: Statistic;

	// @OneToMany(() => UserInChannel, (userInChan) => userInChan.user)
	// userInChan: UserInChannel[]

	// @ManyToOne(() => Channel, (channel) => channel.id, { nullable: true })
	// channels: Channel[];
	
} 
