import { IsNumber } from "class-validator";
import { channelRole } from "src/utils/types/types";

export class PromoteDto {
	@IsNumber()
	userId: number;

	@IsNumber()
	chanId: number;

	role: channelRole;
}