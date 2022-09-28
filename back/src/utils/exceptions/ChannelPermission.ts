import { HttpException, HttpStatus } from "@nestjs/common";

export class ChannelPermissionException extends HttpException {
	constructor() {
		super("You don't have permission on this channel", HttpStatus.UNAUTHORIZED)
	}
}