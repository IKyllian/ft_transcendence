import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetChannelUser = createParamDecorator(
  (data: undefined, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.channelUser;
  }
);