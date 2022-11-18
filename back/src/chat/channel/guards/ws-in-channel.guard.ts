import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotInChannelException } from "src/utils/exceptions";
import { ChannelService } from "../channel.service";

@Injectable()
export class WsInChannelGuard implements CanActivate {
	constructor(private channelService: ChannelService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs();
		const data = client.getData();
		const user = client.getClient().user;
		const channelUser = await this.channelService.getChannelUser(data.chanId, user.id);
		if (!channelUser) {
			throw new NotInChannelException();
		}
		client.getClient().channelUser = channelUser;
		return true;
	}
}