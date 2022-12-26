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
	@Matches(/^[a-zA-Z0-9-_.]+$/)
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