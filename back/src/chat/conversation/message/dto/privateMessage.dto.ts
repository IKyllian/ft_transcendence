import { IsNotEmpty, IsString, IsNumber, MaxLength } from "class-validator";

export class PrivateMessageDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(3000)
	content: string;

	@IsNotEmpty()
	@IsNumber()
	adresseeId: number;
}