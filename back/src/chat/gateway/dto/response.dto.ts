import { IsNumber } from "class-validator";
import { ResponseType } from "src/utils/types/types";

export class ResponseDto {

	@IsNumber()
	id: number;
	
	response: ResponseType;
}