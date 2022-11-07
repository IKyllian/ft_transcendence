import { networkInterfaces } from "os";
import { notificationType } from "src/utils/types/types";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";
import { User } from "./user";

@Entity()
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: notificationType;

	@ManyToOne(() => User)
	addressee: User;

	@ManyToOne(() => User)
	requester: User;

	@ManyToOne(() => Channel)
	channel: Channel;

	// @CreateDateColumn()
	@Column({ nullable: true })
	delete_at?: Date;
}