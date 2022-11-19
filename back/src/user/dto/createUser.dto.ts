import {
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
	IsEmail,
	IsBoolean,
} from 'class-validator'
import { UserAccount } from 'src/typeorm';

export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	username?: string;

	@IsBoolean()
	register?: boolean;

	account: UserAccount;

	@IsOptional()
	@IsNumber()
	id42?: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}