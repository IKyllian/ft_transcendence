import { IsNotEmpty, IsString } from "class-validator";

export class SearchDto {
	@IsString()
	@IsNotEmpty()
	str: string;
}