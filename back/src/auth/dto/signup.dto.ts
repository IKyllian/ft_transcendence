import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(25)
	@IsAlphanumeric()
	username: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}