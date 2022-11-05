import { channelRole } from "src/utils/types/types";
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class ChannelUser  {

	@PrimaryGeneratedColumn()
	id: number;

	@RelationId("user")
	userId: number

	@RelationId("channel")
	channelId: number

	@ManyToOne(() => User, (user) => user.channelUser, {
		nullable: false,
		onDelete: 'CASCADE',
		orphanedRowAction: 'delete',
	})
	user!: User;

	@ManyToOne(() => Channel, (channel) => channel.channelUsers, {
		onDelete: 'CASCADE',
		orphanedRowAction: 'delete',
	})
	channel!: Channel;
	
	@Column({ default: channelRole.MEMBER })
	role: channelRole;
	
	@Column({ default: false })
	is_muted: boolean;
}
