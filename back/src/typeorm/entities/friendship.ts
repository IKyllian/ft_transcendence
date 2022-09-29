import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

export type friendShipStatus = 'requested' | 'accepted' | 'declined';

@Entity()
export class Friendship {
	
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.id)
	requester: User;

	@ManyToOne(() => User, (user) => user.id)
	addressee: User;

	@Column({ nullable: true })
	status: friendShipStatus;

	@CreateDateColumn()
	created_at: Date;
}