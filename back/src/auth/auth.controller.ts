import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Auth42Dto } from "./dto/auth42.dto";
import { JwtGuard } from "./guard/jwt.guard";
import { RefreshGuard } from "./guard/refresh.guard";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	signin(@Body() dto: AuthDto) {
		return this.authService.login(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login42')
	login42(@Body() dto: Auth42Dto) {
		return this.authService.login42(dto);
	}

	@UseGuards(JwtGuard)
	@HttpCode(HttpStatus.OK)
	@Post('logout')
	logout(@GetUser() user: User) {
		return this.authService.logout(user);
	}
	
	@UseGuards(RefreshGuard)
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	refresh(@GetUser() user: User) {
		return this.authService.refreshTokens(user["id"], user["refreshToken"]);
	}
}