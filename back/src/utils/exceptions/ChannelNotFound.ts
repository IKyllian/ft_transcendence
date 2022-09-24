import { HttpException, HttpStatus } from "@nestjs/common";

export class ChannelNotFoundException extends HttpException {
	constructor() {
		super('Channel not found', HttpStatus.NOT_FOUND);
	}
}