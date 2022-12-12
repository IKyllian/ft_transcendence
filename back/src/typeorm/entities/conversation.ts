import { Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, Column } from "typeorm";
import { PrivateMessage } from "./privateMessage";
import { User } from "./user";

@Entity()
export class Conversation {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, {
		createForeignKeyConstraints: false,
	})
	@JoinColumn()
	user1: User;

	@OneToOne(() => User, {
		createForeignKeyConstraints: false,
	})
	@JoinColumn()
	user2: User;

	@OneToMany(() => PrivateMessage, (message) => message.conversation, {
		cascade: ['insert', 'remove'],
	})
	messages: PrivateMessage[];

	@Column({ type: 'timestamptz' })
	updated_at: Date;

}