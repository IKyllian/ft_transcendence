import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User, UserAccount } from "src/typeorm";
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

	public async generateTwoFactorSecret(account: UserAccount) {
		const secret = authenticator.generateSecret();

		const otpUrl = authenticator.keyuri(account.user.username, this.configService.get('TWO_FACTOR_APP_NAME'), secret);

		await this.userService.setTwoFactorSecret(account, secret);

		return { secret, otpUrl };
	}

	public async pipeQrCodeStream(stream: Response, optUrl: string) {
		return toFileStream(stream, optUrl)
	}

	public verify(code: string, account: UserAccount) {
		console.log('received code: ', code);
		
		try {
			return authenticator.verify({
				token: code,
				secret: account.two_factor_secret
			});
		} catch (e) {
			throw new BadRequestException("code not valid")
		}
	}
}