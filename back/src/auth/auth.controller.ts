import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Auth42Dto } from "./dto/auth42.dto";
import { SignupDto } from "./dto/signup.dto";
import { JwtGuard } from "./guard/jwt.guard";
import { RefreshGuard } from "./guard/refresh.guard";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Request } from "express";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	async signup(@Body() dto: SignupDto) {
		return await this.authService.signup(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	async signin(@Body() dto: LoginDto) {
		return await this.authService.login(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login42')
	async login42(@Body() dto: Auth42Dto) {
		return await this.authService.login42(dto);
	}

	@UseGuards(JwtGuard)
	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(@GetUser() user: User) {
		return await this.authService.logout(user);
	}
	
	@UseGuards(RefreshGuard)
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	async refresh(@Req() req: Request) {
		return await this.authService.refreshTokens(req.body);
	}

	@UseGuards(JwtGuard)
	@HttpCode(HttpStatus.OK)
	@Post('verify-token')
	verifyToken(
		@GetUser() user: User,
	) {
		return user;
	}

  	@HttpCode(HttpStatus.OK)
	@Post('forgot-password')
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		return await this.authService.forgotPassword(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('reset-password')
	async resetPassword(@Body() dto: ResetPasswordDto) {
		return await this.authService.resetPassword(dto);
	}
}