import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class GlobalService {
	public server: Server;
	public game_server: Server;
}