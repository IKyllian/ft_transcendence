import { HttpException, HttpStatus } from "@nestjs/common";

export class IsMutedException extends HttpException {
	constructor() {
		super('You are not allowed to send message when you are muted', HttpStatus.FORBIDDEN)
	}
}