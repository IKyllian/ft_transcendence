import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	option: channelOption;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}