import { IsAlphanumeric, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class EditChannelNameDto {

	@IsNumber()
	chanId: number;

	@IsString()
	@IsNotEmpty()
	@IsAlphanumeric()
	@MinLength(2)
	@MaxLength(15)
	name: string;
}