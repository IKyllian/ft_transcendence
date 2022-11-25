import {
	IsAlphanumeric,
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
	password: string;
}