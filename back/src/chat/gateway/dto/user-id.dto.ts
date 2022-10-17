import { IsNumber } from "class-validator";

export class UserIdDto {
	@IsNumber()
	id: number;
}