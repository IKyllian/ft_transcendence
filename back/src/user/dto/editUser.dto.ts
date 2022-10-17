import {
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
} from 'class-validator'

export class EditUserDto {

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	username?: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	avatar?: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	password?: string;
}