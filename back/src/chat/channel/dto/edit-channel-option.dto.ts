import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class EditChannelOptionDto {
	@IsNumber()
	chanId: number;
	
	@IsEnum(channelOption)
	option: channelOption;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@MinLength(5)
	@MaxLength(256)
	password?: string;
}