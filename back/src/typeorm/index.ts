import { Avatar } from "./entities/avatar"
import { Channel } from "./entities/channel"
import { ChannelHash } from "./entities/channel-hash"
import { ChannelUser } from "./entities/channelUser"
import { Friendship } from "./entities/friendship"
import { Message } from "./entities/message"
import { Statistic } from "./entities/statistic"
import { User } from "./entities/user"
import { UserHash } from "./entities/user-hash"

const entities = [
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	UserHash,
	ChannelUser,
	Avatar,
	ChannelHash,
];

export default entities;

export {
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	UserHash,
	ChannelUser,
	Avatar,
	ChannelHash,
}