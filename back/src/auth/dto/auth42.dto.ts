import { IsNotEmpty, IsString } from "class-validator";

export class Auth42Dto {
	@IsString()
	@IsNotEmpty()
	authorizationCode: string;
}