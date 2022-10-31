import { ClassSerializerInterceptor, Controller, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { GetUser } from "src/utils/decorators";
import { TwoFactorService } from "./TwoFactor.service";
import { Response } from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorController {
	constructor(
		private readonly twoFactorService: TwoFactorService
	){}

	@Post('generate')
	@UseGuards(JwtGuard)
	async register(@Res() response: Response, @GetUser() user: User) {
		const { otpUrl } = await this.twoFactorService.generateTwoFactorSecret(user);
		
		return this.twoFactorService.pipeQrCodeStream(response, otpUrl);
	}
}