import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { User, Message } from "src/typeorm";
import { Channel, channelOption } from "src/typeorm/entities/channel";

export class ChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	option?: channelOption;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;

	// constructor(name: string, option: channelOption) {
	// 	this.name = name;
	// 	this.option = option;
	// }

	// public toChannel?(): Channel {
	// 	const channel = new Channel();

	// 	channel.name = this.name;
	// 	channel.option = this.option;

	// 	return channel;
	// }
}