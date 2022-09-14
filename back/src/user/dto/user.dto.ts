import {
	IsNotEmpty,
	IsString,
	IsNumber,
} from 'class-validator'

export class UserDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	hash?: string;

	@IsNumber()
	id42?: number;
}