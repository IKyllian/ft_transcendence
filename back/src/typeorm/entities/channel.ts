import { Exclude } from "class-transformer";
import { channelOption } from "src/utils/types/types";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BannedUser } from "./bannedUser";
import { ChannelMessage } from "./channelMessage";
import { ChannelUser } from "./channelUser";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ default: 'public' })
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

	@OneToMany(() => BannedUser, (bannedUser) => bannedUser.channel, {
		cascade: true,
	})
	bannedUsers: BannedUser[];
}

