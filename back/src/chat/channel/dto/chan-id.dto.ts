import { IsNumber } from "class-validator";

export class ChanIdDto {
	@IsNumber()
	chanId: number;
}