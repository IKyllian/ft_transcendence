import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

export enum channelRole {
	OWNER = 'owner',
	MODERATOR = 'moderator',
	MEMBER = 'clampin'
};

@Entity()
export class ChannelUser extends BaseEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { nullable: false })
	user!: User;

	@ManyToOne(() => Channel, { nullable: false })
	channel!: Channel;
	
	@Column({ default: channelRole.MEMBER })
	role: channelRole;
	
	@Column({ default: false })
	is_muted!: boolean;
	
	@Column({ nullable: true })
	mutedTime?: Date;
}
