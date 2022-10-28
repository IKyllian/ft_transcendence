import { Socket } from "socket.io";
import { User } from "src/typeorm";
import { PlayerType } from "src/utils/types/game.types";
import { WaitingRoom } from "./waiting-room/waiting-room";

export interface GameUser {
	user: User;
	socket: Socket;
	isReady: boolean;
	waitingRoom: WaitingRoom;
	pos?: PlayerType;
}