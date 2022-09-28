import { IsNumber } from "class-validator";

export class RoomDto {
	@IsNumber()
	id: number;
}