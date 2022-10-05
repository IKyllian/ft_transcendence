import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class ChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	option: channelOption;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}