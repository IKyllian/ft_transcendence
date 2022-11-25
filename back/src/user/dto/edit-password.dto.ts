import { IsNotEmpty, IsString } from "class-validator";

export class EditPasswordDto {
	@IsString()
	old: string;

	//TODO validator
	@IsString()
	@IsNotEmpty()
	new: string;
}