import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";

export class EditUsernameDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(15)
	@Matches(/^[A-Za-z0-9_.-—]+$/)
	username: string;
}