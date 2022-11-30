import { Exclude } from "class-transformer";
import { channelOption } from "src/utils/types/types";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelMessage } from "./channelMessage";
import { ChannelUser } from "./channelUser";
import { UserTimeout } from "./userTimeout";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'enum', enum: channelOption, default: channelOption.PUBLIC })
	option: channelOption;

	@OneToMany(() => ChannelUser, (channelUser) => channelUser.channel, {
		cascade: true,
	})
	channelUsers: ChannelUser[];

	@OneToMany(() => ChannelMessage, (message) => message.channel, {
		cascade: ['insert', 'remove'],
	})
	messages: ChannelMessage[];

	@Column({ nullable: true, select: false })
	@Exclude()
	hash?: string;

	@OneToMany(() => UserTimeout, (usersTimeout) => usersTimeout.channel, {
		cascade: true,
	})
	usersTimeout: UserTimeout[];
}

