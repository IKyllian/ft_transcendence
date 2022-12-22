import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
	
    @IsString()
	@IsNotEmpty()
	code: string;

    @IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(256)
	newPassword: string;
}