import { Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch()
export class GatewayExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		if (exception instanceof WsException)
				super.catch(exception, host);
		else if (exception instanceof HttpException){
			const properException = new WsException(exception.getResponse());
			super.catch(properException, host);
		} else {
			throw new WsException(exception.message);
		}
	}
}