import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class SearchToInviteInChanDto {
	@IsNumber()
	chanId: number;

	@MaxLength(50)
	@IsNotEmpty()
	@IsString()
	str: string;
}