import { IsNotEmpty, IsString } from "class-validator";

export class ActivateDto {
	@IsString()
	@IsNotEmpty()
	code: string;
}