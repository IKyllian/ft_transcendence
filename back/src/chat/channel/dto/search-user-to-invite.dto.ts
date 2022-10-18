import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SearchToInviteInChanDto {
	@IsNumber()
	chanId: number;

	@IsNotEmpty()
	@IsString()
	str: string;
}