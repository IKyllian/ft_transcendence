export type JwtPayload = {
	sub: number,
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
	FRIEND_REQUEST = 'friend_request',
	CHANNEL_INVITE = 'channel_invite'
};

export enum ResponseType {
	ACCEPTED = 'accepted',
	DECLINED = 'declined'
};