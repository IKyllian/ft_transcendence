import { Avatar } from "./entities/avatar"
import { Channel } from "./entities/channel"
import { ChannelMessage } from "./entities/channelMessage"
import { ChannelUser } from "./entities/channelUser"
import { Conversation } from "./entities/conversation"
import { Friendship } from "./entities/friendship"
import { PrivateMessage } from "./entities/privateMessage"
import { Statistic } from "./entities/statistic"
import { User } from "./entities/user"
import { Notification } from "./entities/notification"
import { UserTimeout } from "./entities/userTimeout"

const entities = [
	User,
	Channel,
	Friendship,
	ChannelMessage,
	Statistic,
	ChannelUser,
	Avatar,
	Conversation,
	PrivateMessage,
	Notification,
	UserTimeout,
];

export default entities;

export {
	User,
	Channel,
	Friendship,
	ChannelMessage,
	Statistic,
	ChannelUser,
	Avatar,
	Conversation,
	PrivateMessage,
	Notification,
	UserTimeout
}