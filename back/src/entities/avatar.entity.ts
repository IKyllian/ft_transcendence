import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'avatars' })
export class Avatar {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	filename: string;

	// @Column({
	// 	type: 'bytea',
	// })
	// data: Uint8Array;
}