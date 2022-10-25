import { IsString, IsNotEmpty, IsOptional, Min, Max } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	@Min(3)
	@Max(25)
	name: string;

	option: channelOption;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	@Min(3)
	@Max(50)
	password?: string;
}