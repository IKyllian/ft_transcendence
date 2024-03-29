import {
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
	IsEmail,
} from 'class-validator'
import { UserAccount } from 'src/typeorm';

export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	username?: string;

	account: UserAccount;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}