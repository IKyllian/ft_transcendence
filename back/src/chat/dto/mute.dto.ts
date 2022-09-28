import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class MuteDto {

	@IsNumber()
	@IsPositive()
	@IsOptional()
	time: number;
}