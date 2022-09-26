import { Body, ClassSerializerInterceptor, Controller, Get, Post, Req, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
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

	@Post('login42') //create auth42dto
	login42(@Body() body) {
		return this.authService.login42(body.authorizationCode);
	}
	
}