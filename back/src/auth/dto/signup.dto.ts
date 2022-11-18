import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
} from 'class-validator'

export class SignupDto {

	@IsString()
	@IsNotEmpty()
	@Matches(/^[A-Za-z0-9_.-—]+$/)
	username: string;

    @IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}