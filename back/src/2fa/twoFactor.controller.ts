import { Body, ClassSerializerInterceptor, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { TwoFactorService } from "./twoFactor.service";
import { Response } from 'express';
import { TwoFactorDto } from "./dto/2fa.dto";
import { UserService } from "src/user/user.service";
import { Jwt1faGuard } from "src/auth/guard/jwt1fa.guard";

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorController {
	constructor(
		private readonly twoFactorService: TwoFactorService,
		private readonly userService: UserService
	){}

	@Post('generate')
	@UseGuards(Jwt1faGuard)
	async generate(@Res() response: Response, @GetUser() user: User) {
		const { otpUrl } = await this.twoFactorService.generateTwoFactorSecret(user.account);
		
		return this.twoFactorService.pipeQrCodeStream(response, otpUrl);
	}

	@Post('enable')
	@UseGuards(Jwt1faGuard)
	async enableTwoFactor(@GetUser() user: User, @Body() body: TwoFactorDto) {	

		if (user.two_factor_enabled)
			throw new UnauthorizedException('2FA already enabled for this user');
		
		const isValid = this.twoFactorService.verify(body.code, user.account);

		if (!isValid)
			throw new UnauthorizedException('Invalid 2FA code');

		await this.userService.setTwoFactorEnabled(user, true);
		return {success: true}
	}

	@Post('authenticate')
	@UseGuards(Jwt1faGuard)
	async authenticate(@GetUser() user: User, @Body() body: TwoFactorDto) {
		if (user.two_factor_authenticated)
			throw new UnauthorizedException('User already authenticated');
		if (!user.two_factor_enabled)
			throw new UnauthorizedException('2FA is not enabled for this user');

		const isValid = this.twoFactorService.verify(body.code, user.account);

		if (!isValid)
			throw new UnauthorizedException('Invalid 2FA code');
	
		await this.userService.setTwoFactorAuthenticated(user, true);
		return {success: true}
	}
}