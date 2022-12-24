import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthenticatedSocket } from "src/utils/types/auth-socket";
import { JwtPayload } from "src/utils/types/types";
import { AuthService } from "../auth.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: AuthenticatedSocket = context.switchToWs().getClient();
		const token = client.handshake.headers.authorization.split(' ')[1];
		const decoded = this.authService.decodeJwt(token) as JwtPayload;
		const user = await this.userService.findOne({ where: { id: decoded.sub }});
		if (!user) {
			return false;
		}
		client.user = user;
		return true;
	}
}