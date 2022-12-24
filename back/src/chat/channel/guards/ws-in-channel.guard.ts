import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotInChannelException } from "src/utils/exceptions";
import { ChannelService } from "../channel.service";

@Injectable()
export class WsInChannelGuard implements CanActivate {
	constructor(private channelService: ChannelService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ws_context = context.switchToWs();
		const data = ws_context.getData();
		const user = ws_context.getClient().user;
		const channelUser = await this.channelService.getChannelUser(data.chanId, user.id);
		if (!channelUser) {
			throw new NotInChannelException();
		}
		ws_context.getClient().channelUser = channelUser;
		return true;
	}
}