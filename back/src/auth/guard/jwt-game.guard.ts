import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtGameGuard implements CanActivate {
	constructor(
		private authService: AuthService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean | any> {
		const client = context.switchToWs().getClient();
		const token = client.handshake.headers.authorization.split(' ')[1];
		try {
			const payload = this.authService.verifyToken(token, { ignoreExpiration: true });
			client.userInfo = { id: payload.sub, username: payload.username};
			return true;
		} catch {
			// TODO throw ?
			return false;
		}
	}
}