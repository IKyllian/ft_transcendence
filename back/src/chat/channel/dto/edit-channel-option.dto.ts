import { IsEnum, IsNumber } from "class-validator";
import { channelOption } from "src/utils/types/types";

export class EditChannelOptionDto {
	@IsNumber()
	chanId: number;
	
	@IsEnum(channelOption)
	option: channelOption;
}