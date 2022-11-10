import { MESSAGES } from "@nestjs/core/constants";
import { Player } from "src/game/player";

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
	PUBLIC = 'public',
	PRIVATE = 'private',
	PROTECTED = 'protected',
};

export enum notificationType {
	FRIEND_REQUEST,
	CHANNEL_INVITE,
	PARTY_INVITE,
	CHANNEL_MESSAGE,
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

export interface QueueLobbby {
	id: string,
	players: Player[],
	range?: number,
	timeInQueue?: number,
	averageMmr?: number,
}