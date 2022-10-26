import {
	IsNotEmpty,
	IsString,
	Max,
	Min,
} from 'class-validator'

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	@Min(1)
	@Max(15)
	username: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}