import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/entities/user.entity";

@Controller('users')
export class UserController {

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}
}