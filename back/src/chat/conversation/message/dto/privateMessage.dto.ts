import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class PrivateMessageDto {
	@IsNotEmpty()
	@IsString()
	content: string;

	@IsNotEmpty()
	@IsNumber()
	adresseeId: number;
}