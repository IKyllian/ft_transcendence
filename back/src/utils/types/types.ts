export type JwtPayload = {
	sub: number,
	username: string,
}

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
}