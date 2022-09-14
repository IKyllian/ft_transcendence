import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signup')
	signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto);
	}

	@Post('login')
	signin(@Body() dto: AuthDto) {
		return this.authService.login(dto);
	}

	@Post('login42')
	login42(@Body() body) {
		return this.authService.login42(body.authorizationCode);
	}
	
}