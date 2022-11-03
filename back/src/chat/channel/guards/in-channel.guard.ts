import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotInChannelException } from "src/utils/exceptions";
import { ChannelService } from "../channel.service";

@Injectable()
export class InChannelGuard implements CanActivate {
	constructor(private channelService: ChannelService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		let chanId: number = req.params?.chanId;
		if (!chanId)
			chanId = req.body?.chanId;
		const channelUser = await this.channelService.getChannelUser(chanId, req.user.id);
		if (!channelUser)
			throw new NotInChannelException();
		req.user.channelUser = channelUser;
		return true;
	}
}