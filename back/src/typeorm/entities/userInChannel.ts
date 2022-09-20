import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

export type chanRole = 'owner' | 'moderator' | 'pleb';

@Entity()
export class UserInChannel {

	@PrimaryGeneratedColumn()
	id: number;

	// @RelationId((userId: UserInChannel) => userId.user)
	// user_id: number;
	
	// @OneToOne(() => User)
	// @JoinColumn()
	@ManyToOne(() => User, { cascade: true })
	user: User;
	
	@ManyToOne(() => Channel, (channel) => channel.users, { cascade: true })
	channel: Channel;
	
	@Column({ default: 'pleb' })
	role: chanRole;
	
	@Column({ default: false })
	muted: boolean;
	
	@Column({ nullable: true })
	mutedTime?: Date;
}
