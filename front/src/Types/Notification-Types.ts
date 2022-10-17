import { Channel } from "./Chat-Types";
import { UserInterface } from "./User-Types";

enum notificationType {
	FRIEND_REQUEST = 'friend_request',
	CHANNEL_INVITE = 'channel_invite'
};

export interface NotificationInterface {
    id: number,
    type: notificationType,
    addressee: UserInterface,
    requester: UserInterface,
    channel?: Channel,
}