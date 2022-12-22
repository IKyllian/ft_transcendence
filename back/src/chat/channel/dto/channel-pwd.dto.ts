import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ChannelPasswordDto {
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(256)
	password?: string;
}