import { HttpException, HttpStatus } from "@nestjs/common";

export class NotInChannelException extends HttpException {
	constructor() {
		super('User not in this channel', HttpStatus.FORBIDDEN)
	}
}