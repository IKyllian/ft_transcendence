import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotInChannelException } from "src/utils/exceptions";
import { ChannelService } from "../channel/channel.service";

@Injectable()
export class InChannelGuard implements CanActivate {
	constructor(private channelService: ChannelService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const chanId = req.params.id;
		const channelUser = await this.channelService.getChannelUser({ id: chanId}, req.user);
		if (!channelUser)
			throw new NotInChannelException();
		req.channelUser = channelUser;
		return true;
	}
}