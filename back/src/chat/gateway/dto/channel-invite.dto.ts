import { IsNumber } from "class-validator";

export class ChannelInviteDto {
	@IsNumber()
	chanId: number;

	@IsNumber()
	userId: number;
}