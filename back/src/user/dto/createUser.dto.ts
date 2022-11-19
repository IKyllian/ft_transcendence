import {
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
	IsEmail,
} from 'class-validator'

export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	username?: string;

	// @IsNotEmpty()
	// @IsOptional()
	// @IsString()
	// hash?: string;

	@IsOptional()
	@IsNumber()
	id42?: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}