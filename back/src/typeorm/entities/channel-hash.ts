import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from "typeorm";
import { Channel } from "./channel";

@Entity()
export class ChannelHash extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => Channel, (channel) => channel.hash, { onDelete: 'CASCADE' })
	@JoinColumn()
	channel: Channel;

	@Column()
	hash: string;
}