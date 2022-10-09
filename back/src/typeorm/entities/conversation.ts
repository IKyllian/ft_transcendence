import { Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { PrivateMessage } from "./privateMessage";
import { User } from "./user";

@Entity()
export class Conversation {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User)
	@JoinColumn()
	user1: User;

	@OneToOne(() => User)
	@JoinColumn()
	user2: User;

	@OneToMany(() => PrivateMessage, (message) => message.conversation, {
		cascade: ['insert', 'remove'],
	})
	messages: PrivateMessage[];

}