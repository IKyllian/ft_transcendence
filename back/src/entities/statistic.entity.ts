import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Statistic {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, (user) => user.statistic)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ default: 0 })
	matchWon: number;

	@Column({ default: 0 })
	matchLost: number;
}