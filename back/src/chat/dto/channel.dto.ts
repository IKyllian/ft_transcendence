import { IsNotEmpty, IsString } from "class-validator";
import { User, Message } from "src/typeorm";
import { channelOption } from "src/typeorm/entities/channel";

export class ChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	option?: channelOption;

	@IsString()
	@IsNotEmpty()
	password?: string;
	
	users?: User[]
	messages?: Message[];

}