import { Body, ClassSerializerInterceptor, Controller, Post, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { TwoFactorService } from "./TwoFactor.service";
import { Response } from 'express';
import { EnableTwoFactorDto } from "./dto/enable2fa.dto";
import { UserService } from "src/user/user.service";

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorController {
	constructor(
		private readonly twoFactorService: TwoFactorService,
		private readonly userService: UserService
	){}

	@Post('generate')
	@UseGuards(JwtGuard)
	async register(@Res() response: Response, @GetUser() user: User) {
		const { otpUrl } = await this.twoFactorService.generateTwoFactorSecret(user);
		
		return this.twoFactorService.pipeQrCodeStream(response, otpUrl);
	}

	@Post('enable')
	@UseGuards(JwtGuard)
	async enableTwoFactor(@GetUser() user: User, @Body() body: EnableTwoFactorDto) {
		console.log(user.two_factor_enabled);
		
		if (user.two_factor_enabled)
			throw new UnauthorizedException('2FA already enabled for this user');

		const realuser = await this.userService.findOne({ // TEMPORAIRE jusqu'a ce que j'ai trouvé pq y'a pas le two_factor_secret dans le user
			where: {
				username: user.username,
			}
		}, true);

		console.log(realuser.two_factor_enabled);
		
		
		const isValid = this.twoFactorService.verify(body.code, realuser);

		if (!isValid)
			throw new UnauthorizedException('Invalid 2FA code');
		await this.userService.setTwoFactorEnabled(user, true);
		return {success: true}
	}
}