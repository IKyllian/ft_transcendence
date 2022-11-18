import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
	
    @IsString()
	@IsNotEmpty()
	code: string;

    @IsString()
	@IsNotEmpty()
	newPassword: string;
}