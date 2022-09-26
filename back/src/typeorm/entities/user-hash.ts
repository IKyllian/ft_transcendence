import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class UserHash extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user: User;

	@Column()
	hash: string;
}