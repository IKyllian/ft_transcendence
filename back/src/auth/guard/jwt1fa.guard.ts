import { AuthGuard } from "@nestjs/passport";

export class Jwt1faGuard extends AuthGuard('jwt-1fa') {}