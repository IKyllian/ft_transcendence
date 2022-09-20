
import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Avatar } from "./avatar";
import { Channel } from "./channel";
import { Friendship } from "./friendship";
import { Statistic } from "./statistic";


@Entity()
export class User {

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

	// @OneToOne(() => UserInChannel, (userInChan) => userInChan.user)
	// userInChan

	// @ManyToOne(() => Channel, (channel) => channel.id, { nullable: true })
	// channels: Channel[];
	
} 
