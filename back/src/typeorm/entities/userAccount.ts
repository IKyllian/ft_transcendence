import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class UserAccount {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.account, { onDelete: 'CASCADE' } )
    @JoinColumn()
    user: User;

    @Exclude()
	@Column({ nullable: true })
	hash?: string

	@Exclude()
	@Column({ nullable: true })
	refresh_hash?: string

	@Exclude()
	@Column({ nullable: true })
	two_factor_secret?: string

	@Exclude()
	@Column({ nullable: true })
	forgot_code?: string
}