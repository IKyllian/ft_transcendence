import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotInChannelException } from "src/utils/exceptions";
import { ChannelService } from "../channel.service";

@Injectable()
export class WsInChannelGuard implements CanActivate {
	constructor(private channelService: ChannelService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const data = context.switchToWs().getData();
		const req = context.switchToHttp().getRequest();
		const channelUser = await this.channelService.getChannelUser(data.chanId, req.user.id);
		if (!channelUser)
			throw new NotInChannelException();
		req.channelUser = channelUser;
		return true;
	}
}