import { Avatar } from "./entities/avatar"
import { Channel } from "./entities/channel"
import { Friendship } from "./entities/friendship"
import { Message } from "./entities/message"
import { Statistic } from "./entities/statistic"
import { User } from "./entities/user"
import { UserPassHash } from "./entities/user-pass-hash"
import { UserInChannel } from "./entities/userInChannel"

const entities = [
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	UserPassHash,
	UserInChannel,
	Avatar,
];

export default entities;

export {
	User,
	Channel,
	Friendship,
	Message,
	Statistic,
	UserPassHash,
	UserInChannel,
	Avatar,
}