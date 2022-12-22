import {
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
  	Matches,
  	IsEmail
} from 'class-validator'

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(15)
	@Matches(/^[A-Za-z0-9_.-—]+$/)
	username: string;
  
  	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(256)
	password: string;
}