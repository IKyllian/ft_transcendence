import { Channel } from "./Chat-Types";
import { UserInterface } from "./User-Types";

export enum notificationType {
	FRIEND_REQUEST = 'friend_request',
	CHANNEL_INVITE = 'channel_invite',
	GAME_INVITE = 'game_invite',
    CHANNEL_MESSAGE = 'channel_message',
};

export interface NotificationInterface {
    id: number,
    type: notificationType,
    addressee: UserInterface,
    requester: UserInterface,
    channel?: Channel,
}