import { Avatar } from "./entities/avatar"
import { Channel } from "./entities/channel"
import { ChannelUser } from "./entities/channelUser"
import { Friendship } from "./entities/friendship"
import { Message } from "./entities/message"
import { Statistic } from "./entities/statistic"
import { User } from "./entities/user"

const entities = [
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	ChannelUser,
	Avatar,
];

export default entities;

export {
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	ChannelUser,
	Avatar,
}