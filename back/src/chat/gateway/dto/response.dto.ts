import { IsNumber, IsOptional } from "class-validator";
import { ResponseType } from "src/utils/types/types";

export class ResponseDto {

	@IsNumber()
	id: number;

	@IsNumber()
	@IsOptional()
	chanId: number;
	
	response: ResponseType;
}