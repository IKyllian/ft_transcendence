import { IsNumber, IsOptional, IsPositive, Max, max } from "class-validator";

export class MuteUserDto {
	@IsNumber()
	userId: number;

	@IsNumber()
	chanId: number;

	@IsNumber()
	@IsPositive()
	// @IsOptional()
	@Max(1200) // 20 min
	time: number;
}