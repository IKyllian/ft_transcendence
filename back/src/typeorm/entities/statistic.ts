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
	singles_match_won: number;

	@Column({ default: 0 })
	singles_match_lost: number;

	@Column({ default: 0 })
	doubles_match_won: number;

	@Column({ default: 0 })
	doubles_match_lost: number;
}