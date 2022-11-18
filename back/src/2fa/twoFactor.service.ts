import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "src/typeorm";
import { UserService } from "src/user/user.service";
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	){}

	public async generateTwoFactorSecret(user: User) {
		const secret = authenticator.generateSecret();

		const otpUrl = authenticator.keyuri(user.username, this.configService.get('TWO_FACTOR_APP_NAME'), secret);

		await this.userService.setTwoFactorSecret(user, secret);

		return { secret, otpUrl };
	}

	public async pipeQrCodeStream(stream: Response, optUrl: string) {
		return toFileStream(stream, optUrl)
	}

	public verify(code: string, user: User) {
		console.log('received code: ', code);
		console.log('secret: ', user.two_factor_secret);
		
		return authenticator.verify({
			token: code,
			secret: user.two_factor_secret
		});
	}
}