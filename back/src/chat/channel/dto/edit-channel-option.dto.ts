import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class EditChannelOptionDto {
	@IsNumber()
	chanId: number;
	
	@IsEnum(channelOption)
	option: channelOption;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	password?: string;
}