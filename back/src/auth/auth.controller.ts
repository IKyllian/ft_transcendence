import { Body, Controller, Get, Post, Req, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Auth42Dto } from "./dto/auth42.dto";

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
	login42(@Body() dto: Auth42Dto) {
		return this.authService.login42(dto);
	}
	
}