import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Represents a user that registered but hasn't validated his email address yet
@Entity()
export class PendingUser {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
	username: string;

    @Column({ unique: true })
	validation_code: string;

	@Column()
	hash: string
}