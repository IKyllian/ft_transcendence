import { Socket } from "socket.io";
import { UserPayload } from "src/utils/types/types";

export interface AuthenticatedSocket extends Socket {
	userInfo: UserPayload;
}