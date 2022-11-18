import { MESSAGES } from "@nestjs/core/constants";
import { generate } from "shortid";
import { Player } from "src/game/player";
import { ChannelUser, User, UserTimeout } from "src/typeorm";
import { GameType } from "./game.types";

export type JwtPayload = {
	sub: number,
	username: string,
};

export type UserPayload = {
	id: number,
	username: string,
};

export type FindUserParams = Partial<{
	id: number;
	id42: number;
	username: string;
}>;

export type FindChannelParams = Partial<{
	id: number;
	name: string;
}>;

export enum channelRole {
	OWNER = 'owner',
	MODERATOR = 'moderator',
	MEMBER = 'clampin'
};

export enum channelOption {
	PUBLIC,
	PRIVATE,
	PROTECTED,
};

export enum notificationType {
	FRIEND_REQUEST,
	CHANNEL_INVITE,
	PARTY_INVITE,
	CHANNEL_MESSAGE,
	PRIVATE_MESSAGE,
};

export enum ResponseType {
	ACCEPTED = 'accepted',
	DECLINED = 'declined'
};

export enum RelationStatus {
	REQUESTED = 'requested',
	PENDIND = 'pending',
	FRIEND = 'friend',
	NONE = 'none'
}

export enum TimeoutType {
	BAN,
	MUTE,
}

export enum ChannelUpdateType {
	JOIN,
	LEAVE,
	BAN,
	MUTE,
	UNTIMEOUT,
	CHANUSER,
}

export type EloRange = {
	low: number;
	mid: number;
	hight: number;
	max: number;
}

export class QueueLobby {
	constructor(game_type: GameType) {
		this.id = generate();
		this.range = 0;
		this.timeInQueue = 0;
		this.averageMmr = 0;	
		this.players = new Array<Player>();
		this.game_type = game_type;
	}
	id: string;
	game_type: GameType;
	players: Player[];
	range: number;
	timeInQueue: number;
	averageMmr: number;

	addPlayer(player: Player) {
		this.players.push(player);
		this.averageMmr += this.game_type === GameType.Singles ? player.user.singles_elo : player.user.doubles_elo;
		this.averageMmr /= this.players.length;
	}
}

export enum UserStatus {
	ONLINE,
	OFFLINE,
	IN_GAME,
}

export type PartyMessage = {
	sender: User;
	content: string;
	send_at: Date;
}