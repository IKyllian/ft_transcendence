import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class EditPasswordDto {
	@IsString()
	old: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(256)
	new: string;
}