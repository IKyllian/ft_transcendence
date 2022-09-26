import { Exclude } from "class-transformer";
import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { ChannelDto } from "src/chat/dto/channel.dto";
import { channelOption } from "src/utils/types/types";
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, Unique } from "typeorm";
import { ChannelHash } from "./channel-hash";
import { ChannelUser } from "./channelUser";
import { Message } from "./message";
import { User } from "./user";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ default: 'public' })
	option: channelOption;

	@Column({ default: 0 })
	nb: number;

	@OneToMany(() => ChannelUser, (channelUser) => channelUser.channel, {
		cascade: true,
		onDelete: 'CASCADE'
	})
	channelUsers: ChannelUser[];

	@OneToMany(() => Message, (message) => message.id, {
		cascade: ['insert', 'remove'],
		// onDelete: "CASCADE",
	})
	messages: Message[];

	@Column({ nullable: true, select: false })
	@Exclude()
	hash: string;

}