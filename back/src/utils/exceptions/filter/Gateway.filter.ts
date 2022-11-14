import { Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch()
export class GatewayExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		if (exception instanceof WsException)
				super.catch(exception, host);
		else if (exception instanceof HttpException){
			console.log(exception.message);
			const properException = new WsException(exception.getResponse());
			super.catch(properException, host);
		} else {
			console.log(exception.message);
			console.log("unknown exception");
		}
	}
}