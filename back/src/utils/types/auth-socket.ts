import { Socket } from "socket.io";
import { User } from "src/typeorm";

export interface AuthenticatedSocket extends Socket {
	user: User;
	multiTab: boolean;
}