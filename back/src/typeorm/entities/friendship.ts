import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

export type friendShipStatus = 'requested' | 'accepted' | 'declined';

@Entity()
export class Friendship {
	
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.friendshipSend, { cascade: true })
	requester: User;

	@ManyToOne(() => User, (user) => user.friendshipReceived, { cascade: true })
	addressee: User;

	@Column({ nullable: true })
	status: friendShipStatus;

	@CreateDateColumn()
	created_at: Date;
}