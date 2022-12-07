import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SearchDto {
	@MaxLength(50)
	@IsString()
	@IsNotEmpty()
	str: string;
}