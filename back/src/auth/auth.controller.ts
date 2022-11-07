import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Auth42Dto } from "./dto/auth42.dto";
import { JwtGuard } from "./guard/jwt.guard";
import { RefreshGuard } from "./guard/refresh.guard";
import { SignupDto } from "./dto/signup.dto";
import { ActivateDto } from "./dto/activate.dto";
import { ForgotPasswordDto } from "./dto/forgotpassword.dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	signup(@Body() dto: SignupDto) {
		return this.authService.signup(dto);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('activate')
	activate(@Body() dto: ActivateDto) {
		return this.authService.activate(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	signin(@Body() dto: LoginDto) {
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

	@HttpCode(HttpStatus.OK)
	@Post('forgot-password')
	forgotPassword(dto: ForgotPasswordDto) {
		
	}
}