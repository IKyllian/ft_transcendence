import { channel } from "diagnostics_channel";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class BannedUser {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, {
		orphanedRowAction: 'delete',
	})
	user: User;

	@ManyToOne(() => Channel, (channel) => channel.bannedUsers, {
		orphanedRowAction: 'delete',
	})
	channel: Channel;

	@CreateDateColumn()
	created_at: Date;

	@Column({ nullable: true })
	time?: number;
}