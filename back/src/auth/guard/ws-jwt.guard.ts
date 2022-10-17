import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(
		private authService: AuthService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean | any> {
		const client = context.switchToWs().getClient();
		const token = client.handshake.headers.authorization.split(' ')[1];
    	const user = await this.authService.verify(token);
		if (!user)
			client.disconnect();
		context.switchToHttp().getRequest().user = user
		return user ? user : false;
	}
}