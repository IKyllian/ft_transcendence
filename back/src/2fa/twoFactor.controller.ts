import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { TwoFactorService } from "./twoFactor.service";
import { Response } from 'express';
import { TwoFactorDto } from "./dto/2fa.dto";
import { UserService } from "src/user/user.service";
import { Jwt1faGuard } from "src/auth/guard/jwt1fa.guard";
import { AuthService } from "src/auth/auth.service";
import { JwtGuard } from "src/auth/guard/jwt.guard";

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorController {
	constructor(
		private readonly twoFactorService: TwoFactorService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	){}

	@Post('generate')
	@UseGuards(JwtGuard)
	async generate(@Res() response: Response, @GetUser() user: User) {
		const { otpUrl } = await this.twoFactorService.generateTwoFactorSecret(user);
		
		return this.twoFactorService.pipeQrCodeStream(response, otpUrl);
	}

	@Post('enable')
	@UseGuards(JwtGuard)
	async enableTwoFactor(@GetUser() user: User, @Body() body: TwoFactorDto) {	

		if (user.two_factor_enabled)
			throw new BadRequestException('2FA already enabled for this user');
		
		const isValid = this.twoFactorService.verify(body.code, user.account);

		if (!isValid)
			throw new BadRequestException('Invalid 2FA code');

		await this.userService.setTwoFactorEnabled(user, true);
		return {success: true}
	}

	@Post('disable')
	@UseGuards(JwtGuard)
	async disableTwoFactor(@GetUser() user: User, @Body() body: TwoFactorDto) {	
		if (!user.two_factor_enabled)
			throw new BadRequestException('2FA already disable for this user');
		
		const isValid = this.twoFactorService.verify(body.code, user.account);

		if (!isValid)
			throw new BadRequestException('Invalid 2FA code');

		await this.userService.setTwoFactorEnabled(user, false);
		return {success: true}
	}

	@Post('authenticate')
	@UseGuards(Jwt1faGuard)
	async authenticate(@GetUser() user: User, @Body() body: TwoFactorDto) {
		if (!user.two_factor_enabled)
			throw new UnauthorizedException('2FA is not enabled for this user');

		const isValid = this.twoFactorService.verify(body.code, user.account);

		if (!isValid)
			throw new UnauthorizedException('Invalid 2FA code');
	
		const tokens = await this.authService.signTokens(user.id, user.username);
		this.authService.updateRefreshHash(user.account, tokens.refresh_token);
		return {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			user: user,
		};
	}
}