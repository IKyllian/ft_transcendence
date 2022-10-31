import {
	IsNotEmpty,
	IsString,
} from 'class-validator'

export class EnableTwoFactorDto {
	@IsString()
	@IsNotEmpty()
	code: string;
}