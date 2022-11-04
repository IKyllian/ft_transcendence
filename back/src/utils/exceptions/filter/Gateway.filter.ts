import { Catch, ArgumentsHost } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch()
export class GatewayExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		if (exception instanceof WsException)
				super.catch(exception, host);
		else {
			const properException = new WsException(exception.getResponse());
			super.catch(properException, host);
		}
	}
}