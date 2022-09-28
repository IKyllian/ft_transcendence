import { channelRole } from "src/utils/types/types";
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class ChannelUser  {

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.channelUser, {
		nullable: false,
		// onDelete: 'CASCADE',
	})
	user!: User;

	@ManyToOne(() => Channel, (channel) => channel.channelUsers, {
		onDelete: 'CASCADE'
	})
	channel!: Channel;
	
	@Column({ default: channelRole.MEMBER })
	role: channelRole;
	
	@Column({ default: false })
	is_muted!: boolean;
	
	@Column({ nullable: true })
	mutedTime?: Date;
}
