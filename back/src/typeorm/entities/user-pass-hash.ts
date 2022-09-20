import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPassHash {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	user_id: number;

	@Column()
	hash: string;
}