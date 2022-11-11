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

	@ManyToOne(() => User, { orphanedRowAction: 'delete' })
	addressee: User;

	@ManyToOne(() => User, { orphanedRowAction: 'delete' })
	requester: User;

	@ManyToOne(() => Channel, { orphanedRowAction: 'delete' })
	channel: Channel;

	// @CreateDateColumn()
	@Column({ nullable: true })
	delete_at?: Date;
}