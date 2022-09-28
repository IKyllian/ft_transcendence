import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ChannelPasswordDto {
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}