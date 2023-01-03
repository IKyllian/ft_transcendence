import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isNumber } from "class-validator";
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
		
		if (!chanId || !isNumber(chanId) || chanId < 0 || chanId > 2147483647) {
			return false;
		}
		
		const channelUser = await this.channelService.getChannelUser(chanId, req.user.id);
		if (!channelUser)
			throw new NotInChannelException();
		req.channelUser = channelUser;
		return true;
	}
}