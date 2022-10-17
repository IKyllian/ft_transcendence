import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Statistic extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, (user) => user.statistic, { onDelete: 'CASCADE'})
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ default: 0 })
	matchWon: number;

	@Column({ default: 0 })
	matchLost: number;
}