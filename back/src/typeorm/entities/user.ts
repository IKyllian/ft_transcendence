
import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne, BaseEntity } from "typeorm";
import { Avatar } from "./avatar";
import { Channel } from "./channel";
import { Friendship } from "./friendship";
import { Statistic } from "./statistic";
import { UserInChannel } from "./userInChannel";


@Entity()
export class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({ nullable: true })
	@Exclude()
	id42?: number;

	@Column({ unique: true, nullable: true })
	username: string;
	
	/* @OneToOne(() => Avatar, { nullable: true })
	@JoinColumn({ name: 'avatar_id' }) */
	@Column({ nullable: true })
	avatar?: string;
	//avatar?: Avatar;
	
	@OneToOne(() => Statistic, (statistic) => statistic.user, { cascade: true, eager: true })
	statistic: Statistic;

	// @OneToMany(() => UserInChannel, (userInChan) => userInChan.user)
	// userInChan: UserInChannel[]

	// @ManyToOne(() => Channel, (channel) => channel.id, { nullable: true })
	// channels: Channel[];
	
} 
