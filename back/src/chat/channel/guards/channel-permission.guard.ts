import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { ChannelUser } from "src/typeorm";
import { ChannelPermissionException } from "src/utils/exceptions";
import { channelRole } from "src/utils/types/types";

@Injectable()
export class ChannelPermissionGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const channelUser: ChannelUser = context.switchToHttp().getRequest().channelUser;
		if (channelUser && channelUser.role === channelRole.MODERATOR || channelRole.OWNER )
			return true;
		throw new ChannelPermissionException();
	}
}