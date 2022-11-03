import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { AuthService } from "../auth.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(
		private authService: AuthService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: AuthenticatedSocket = context.switchToWs().getClient();
		const token = client.handshake.headers.authorization.split(' ')[1];
		try {
			this.authService.verifyToken(token);
			return true;
		} catch (e) {
			console.log(client.user.username, 'Token not valid')
			client.disconnect();
			return false;
		}
		// if (!user)
		// client.user = user;
		// // context.switchToHttp().getRequest().user = user
		// return user ? true : false;
	}
}