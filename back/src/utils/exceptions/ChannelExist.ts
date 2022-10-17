import { HttpException, HttpStatus } from "@nestjs/common";

export class ChannelExistException extends HttpException {
	constructor() {
		super('Channel already exist', HttpStatus.CONFLICT);
	}
}