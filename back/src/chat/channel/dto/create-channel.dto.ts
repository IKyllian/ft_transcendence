import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEnum, IsAlphanumeric } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	@IsAlphanumeric()
	@MinLength(2)
	@MaxLength(20)
	name: string;

	@IsEnum(channelOption)
	option: channelOption;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(50)
	password?: string;
}