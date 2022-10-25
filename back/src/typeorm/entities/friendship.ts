import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

export type friendshipStatus = 'requested' | 'accepted' | 'declined';

@Entity()
export class Friendship {
	
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user, { cascade: true })
	requester: User;

	@ManyToOne(() => User, (user) => user, { cascade: true })
	addressee: User;

	@Column({ nullable: true })
	status: friendshipStatus;

	@CreateDateColumn()
	created_at: Date;
}