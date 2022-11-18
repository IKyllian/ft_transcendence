import { IsNotEmpty, IsString } from "class-validator";

export class PartyMessageDto {
	@IsString()
	@IsNotEmpty()
	content: string;
}