import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

export type chanRole = 'owner' | 'moderator' | 'pleb';

@Entity()
export class UserInChannel extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	user: User;
	
	@ManyToOne(() => Channel, (channel) => channel.users)
	channel: Channel;
	
	@Column({ default: 'pleb' })
	role: chanRole;
	
	@Column({ default: false })
	is_muted: boolean;
	
	@Column({ nullable: true })
	mutedTime?: Date;
}
