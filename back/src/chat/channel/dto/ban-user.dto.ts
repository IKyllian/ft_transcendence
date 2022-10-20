import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class BanUserDto {
	@IsNumber()
	userId: number;

	@IsNumber()
	chanId: number;

	@IsNumber()
	@IsPositive()
	@IsOptional()
	time?: number;
}