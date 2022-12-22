import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class JoinChannelDto {
	@IsNumber()
	id: number;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}