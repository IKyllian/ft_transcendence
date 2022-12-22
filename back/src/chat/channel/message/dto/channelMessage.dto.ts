import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class ChannelMessageDto {

	@IsNotEmpty()
	@IsString()
	@MaxLength(3000)
	content: string;

	@IsNotEmpty()
	@IsNumber()
	chanId: number;
}

export class SkipDto {
	@IsNumber()
	skip: number;
}