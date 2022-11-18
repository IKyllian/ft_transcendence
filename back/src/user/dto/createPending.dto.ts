import {
	IsNotEmpty,
	IsString,
} from 'class-validator'

export class CreatePendingDto {

	@IsString()
	@IsNotEmpty()
	username: string;

    @IsString()
	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	@IsString()
	hash: string;
}