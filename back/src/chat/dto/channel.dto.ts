import { IsNotEmpty, IsString } from "class-validator";
import { channelOption } from "src/entities/channel.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/entities/user.entity";

export class ChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	option: channelOption;

	@IsString()
	@IsNotEmpty()
	password?: string;
	
	users?: User[]
	messages?: Message[];

}