import {
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
} from 'class-validator'

export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	username?: string;

	@IsNotEmpty()
	@IsOptional()
	@IsString()
	hash?: string;

	@IsOptional()
	@IsNumber()
	id42?: number;
}