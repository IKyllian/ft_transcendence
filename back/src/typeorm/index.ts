import { Avatar } from "./entities/avatar"
import { Channel } from "./entities/channel"
import { ChannelMessage } from "./entities/channelMessage"
import { ChannelUser } from "./entities/channelUser"
import { Friendship } from "./entities/friendship"
import { Statistic } from "./entities/statistic"
import { User } from "./entities/user"

const entities = [
	User,
	Channel,
	Friendship,
	ChannelMessage,
	Statistic,
	ChannelUser,
	Avatar,
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
}