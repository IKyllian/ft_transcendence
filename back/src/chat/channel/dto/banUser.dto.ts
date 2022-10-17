import { IsNumber, IsOptional } from "class-validator";

export class BanUserDto {
	@IsNumber()
	userId: number;

	@IsNumber()
	chanId: number;

	@IsNumber()
	@IsOptional()
	time?: number;
}