import { Channel } from "./Chat-Types";
import { UserInterface } from "./User-Types";

export enum notificationType {
	FRIEND_REQUEST ,
	CHANNEL_INVITE,
	PARTY_INVITE,
    CHANNEL_MESSAGE,
};

export interface NotificationInterface {
    id: number,
    type: notificationType,
    addressee: UserInterface,
    requester: UserInterface,
    channel?: Channel,
}