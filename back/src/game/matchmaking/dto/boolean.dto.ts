import { IsBoolean } from "class-validator";

export class IsReadyDto {
	@IsBoolean()
	isReady: boolean;
}