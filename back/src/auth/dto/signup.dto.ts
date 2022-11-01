import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(15)
	@IsAlphanumeric()
	username: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}