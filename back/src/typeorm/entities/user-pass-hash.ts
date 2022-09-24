import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class UserPassHash extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	// @Column({ unique: true })
	// user_id: number;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@Column()
	hash: string;
}