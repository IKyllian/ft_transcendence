import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPassHash extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	user_id: number;

	@Column()
	hash: string;
}