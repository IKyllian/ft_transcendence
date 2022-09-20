
import { Exclude } from "class-transformer";
import { Socket } from "socket.io";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Avatar } from "./avatar.entity";
import { Channel } from "./channel.entity";
import { Friendship } from "./friendship.entity";
import { Statistic } from "./statistic.entity";
import { UserInChannel } from "./userInChannel.entity";


@Entity({ name: "users" })
export class User {

	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({ nullable: true })
	@Exclude()
	id42?: number;

	@Column({ unique: true, nullable: true })
	username: string;

	// @Column({ nullable: true })
	// @Exclude()
	// hash?: string
	
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
