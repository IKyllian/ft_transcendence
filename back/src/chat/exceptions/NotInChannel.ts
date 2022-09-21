import { HttpException, HttpStatus } from "@nestjs/common";

export class NotInChannelException extends HttpException {
	constructor() {
		super('You are not in this channel', HttpStatus.FORBIDDEN)
	}
}