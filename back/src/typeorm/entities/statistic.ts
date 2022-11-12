import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Statistic extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, (user) => user.statistic, { onDelete: 'CASCADE'})
	@JoinColumn()
	user: User;

	@Column({ default: 0 })
	match_won: number;

	@Column({ default: 0 })
	match_lost: number;
}