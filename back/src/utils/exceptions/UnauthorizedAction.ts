import { HttpException, HttpStatus } from "@nestjs/common";

export class UnauthorizedActionException extends HttpException {
	constructor() {
		super('You are not authorized to execute this action', HttpStatus.UNAUTHORIZED)
	}
}