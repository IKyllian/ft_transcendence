import { ArgumentsHost, Catch, NotFoundException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WsException, BaseWsExceptionFilter, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { ChannelMessage, ChannelUser, Notification, User } from 'src/typeorm';
import { ChannelService } from '../channel/channel.service';
import { ChatSessionManager } from './chat.session';
import { UserService } from 'src/user/user.service';
import { JwtPayload, notificationType } from 'src/utils/types/types';
import { GetChannelUser, GetUser } from 'src/utils/decorators';
import { ChannelMessageService } from '../channel/message/ChannelMessage.service';
import { ChannelMessageDto } from '../channel/message/dto/channelMessage.dto';
import { RoomDto } from './dto/room.dto';
import { PrivateMessageService } from '../conversation/message/private-msg.sevice';
import { PrivateMessageDto } from '../conversation/message/dto/privateMessage.dto';
import { UserIdDto } from './dto/user-id.dto';
import { FriendshipService } from 'src/user/friendship/friendship.service';
import { NotificationService } from 'src/notification/notification.service';
import { ResponseDto } from './dto/response.dto';
import { ChannelPasswordDto } from '../channel/dto/channel-pwd.dto';
import { ChannelInviteDto } from './dto/channel-invite.dto';
import { BanUserDto } from '../channel/dto/ban-user.dto';
import { ChannelPermissionGuard } from '../channel/guards';
import { WsInChannelGuard } from '../channel/guards/ws-in-channel.guard';
import { ConversationService } from '../conversation/conversation.service';
import { MuteUserDto } from '../channel/dto/mute-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { OnTypingChannelDto } from './dto/on-typing-chan.dto';
import { OnTypingPrivateDto } from './dto/on-typing-priv.dto';
import { GatewayExceptionFilter } from 'src/utils/exceptions/filter/Gateway.filter';
import { PartyService } from 'src/game/matchmaking/party/party.service';
import { AuthenticatedSocket } from 'src/utils/types/auth-socket';

@UseFilters(GatewayExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
	cors: {
		credential: true,
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

@WebSocketServer() server: Server;

	constructor(
		private channelMsgService: ChannelMessageService,
		private privateMsgService: PrivateMessageService,
		private authService: AuthService,
		private channelService: ChannelService,
		private readonly session: ChatSessionManager,
		private userService: UserService,
		private friendshipService: FriendshipService,
		private notificationService: NotificationService,
		private convService: ConversationService,
		private partyService: PartyService,
		) {}

	// afterInit(serverr: Server) {
	// 		// console.log(this.server)
	// }

	//test
	@SubscribeMessage('hello') 
	hello(@ConnectedSocket() socket: Socket) {
		console.log('test')
		// socket.emit('hello', 'hello');
		this.server.emit('hello', "cccc")
	}

	async handleConnection(socket: AuthenticatedSocket) {
		let user: User = null;
		if (socket.handshake.headers.authorization) {
			// console.log(socket.handshake.headers)
			const token = socket.handshake.headers.authorization.split(' ')[1];
			user = await this.authService.verify(token);
		}

		if (!user) {
			// throw new WsException('invalid credential');
			console.log(user, 'invalid credential')
			return socket.disconnect();
			// socket.emit('connection', 'failed');
		}
		socket.user = user;
		console.log(user.username, 'connected')
		this.server.to(socket.id).emit('StatusUpdate', user);
		socket.join(`user-${user.id}`);
		if (user.status === 'offline') {
			this.userService.setStatus(user, 'online');
		}
		// this.session.setUserSocket(socket.id, { user, socket });
		socket.emit('Connection', {
			friendList: await this.friendshipService.getFriendlist(user),
			notification: await this.notificationService.getNotification(user),
			party: this.partyService.partyJoined.getParty(user.id),
		});
	}

	async handleDisconnect(socket: Socket) {
		console.log('disco')
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			// get usersocket instance instead of call db ?
			// this.session.removeUserSocket(socket.id);
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user) {
				this.userService.setStatus(user, 'offline');
				socket.emit('statusUpdate', { user, status: 'offline' });
			}
			console.log(payload?.username, 'disconnected');
			} else
				console.log(socket.id, 'disconnected');
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinChannelRoom')
	async joinChannelRoom(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() room: RoomDto,
	) {
		console.log(socket.user.username + ' joined room')
		const chanInfo = await this.channelService.getChannelById(socket.user.id, room.id);
		socket.emit('roomData', chanInfo);
		socket.join(`channel-${ chanInfo.id }`);
		const notif = await this.notificationService.findOne({
			where: {
				addressee: { id: socket.user.id },
				channel: { id: chanInfo.id },
				type: notificationType.CHANNEL_MESSAGE,
			}
		});
		if (notif) {
			await this.notificationService.delete(notif.id);
			this.server.to(`user-${socket.user.id}`).emit('DeleteNotification', notif.id);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveChannelRoom')
	leaveChannelRoom(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() room: RoomDto) {
		socket.leave(`channel-${ room.id }`);
		console.log(socket.user.username + ' left room')
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('ChannelMessage')
	async sendChannelMessage(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: ChannelMessageDto,
		) {
			//TODO inchannelGuard
			const message = await this.channelMsgService.create(socket.user.id, data);
			this.server.to(`channel-${ data.chanId }`).emit('NewChannelMessage', message);
			this.notificationService.sendMessageNotif(socket, data.chanId);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PrivateMessage')
	async sendPrivateMessage(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: PrivateMessageDto,
		) {
			const message = await this.privateMsgService.create(socket.user.id, data);
			this.server
			.to(`user-${socket.user.id}`)
			.to(`user-${data.adresseeId}`)
			.emit('NewPrivateMessage', message);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateConversation')
	async createConversation(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: PrivateMessageDto,
	) {
		const conv = await this.convService.create(socket.user, data.adresseeId, data.content);
		this.server
		.to(`user-${socket.user.id}`)
		.to(`user-${data.adresseeId}`)
		.emit('NewConversation', { conv, socketId: socket.id });
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('FriendRequest')
	async sendFriendRequest(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() dto: UserIdDto,
	) {
		const addressee = await this.userService.findOneBy({ id: dto.id });
		if (!addressee)
			throw new NotFoundException('User not found');
		await this.friendshipService.sendFriendRequest(socket.user, addressee);
		this.server.to(`user-${socket.user.id}`).emit("RequestValidation");
		const notif = await this.notificationService.createFriendRequestNotif(addressee, socket.user);
		socket.to(`user-${dto.id}`).emit('NewNotification', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('FriendRequestResponse')
	async friendRequestResponse(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() dto: ResponseDto,
	) {
		const requester = await this.userService.findOneBy({ id: dto.id });
		if (!requester)
			throw new NotFoundException('User not found');
		const friendship = await this.friendshipService.friendRequestResponse(socket.user, requester, dto);
		const notif = await this.notificationService.findOne({
			where: {
				requester: { id: requester.id },
				addressee: { id: socket.user.id },
				type: notificationType.FRIEND_REQUEST,
			}
		});
		this.server.to(`user-${socket.user.id}`).emit("RequestValidation");
		if (notif) {
			await this.notificationService.delete(notif.id);
			this.server.to(`user-${socket.user.id}`).emit('DeleteNotification', notif.id);
		}
		if (friendship.status === 'accepted') {
			this.server.to(`user-${socket.user.id}`).emit('FriendListUpdate', await this.friendshipService.getFriendlist(socket.user));
			this.server.to(`user-${requester.id}`).emit('FriendListUpdate', await this.friendshipService.getFriendlist(requester));
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('UnFriend')
	async unFriend(
		@GetUser() user: User,
		@MessageBody() dto: UserIdDto,
	) {
		const user2 = await this.friendshipService.unFriend(user, dto);
		this.server.to(`user-${user.id}`).emit('FriendListUpdate', await this.friendshipService.getFriendlist(user));
		this.server.to(`user-${user2.id}`).emit('FriendListUpdate', await this.friendshipService.getFriendlist(user2));
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinChannel')
	async joinChannel(
		@GetUser() user: User,
		@MessageBody() channel: RoomDto,
		@MessageBody() pwdDto?: ChannelPasswordDto,
	) {
		const updatedChan = await this.channelService.join(user, channel.id, pwdDto);
		this.server.to(`channel-${channel.id}`).emit('ChannelUsersUpdate', updatedChan);
		this.server.to(`user-${user.id}`).emit('OnJoin', updatedChan);
		const servMsg = await this.channelMsgService.createServer({
			chanId: updatedChan.id,
			content: `Welcome ${user.username}, say hi!`,
		});
		this.server.to(`channel-${channel.id}`).emit('NewChannelMessage', servMsg);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveChannel')
	async leaveChannel(
		@GetUser() user: User,
		@MessageBody() channel: RoomDto,
	) {
		const updatedChan = await this.channelService.leave(user, channel.id);
		this.server.to(`channel-${channel.id}`).emit('ChannelUsersUpdate', updatedChan);
		this.server.to(`user-${user.id}`).emit('OnLeave', updatedChan);
		const servMsg = await this.channelMsgService.createServer({
				chanId: updatedChan.id,
				content: `${user.username} just left.`,
		});
		this.server.to(`channel-${channel.id}`).emit('NewChannelMessage', servMsg);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard)
	@SubscribeMessage('ChannelInvite')
	async channelInvite(
		@GetUser() user: User,
		@MessageBody() dto: ChannelInviteDto,
	) {
		const notif = await this.notificationService.createChanInviteNotif(user, dto);
		this.server.to(`user-${dto.userId}`).emit('NewNotification', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('ChannelInviteResponse')
	async respondToChannelInvite(
		@GetUser() user: User,
		@MessageBody() dto: ResponseDto,
	) {
		const updatedChan = await this.channelService.respondInvite(user, dto);
		if (updatedChan) {
			this.server.to(`channel-${updatedChan.id}`).emit('ChannelUsersUpdate', updatedChan);
			this.server.to(`user-${user.id}`).emit('OnJoin', updatedChan);
		}
		this.server.to(`user-${user.id}`).emit('DeleteNotification', dto.id);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('Ban')
	async banUser(
		@GetUser() user: User,
		@MessageBody() dto: BanUserDto,
	) {
		console.log("banning")
		const updatedChan = await this.channelService.banUser(user.id, dto);
		this.server.to(`channel-${updatedChan.id}`).emit('ChannelUsersUpdate', updatedChan);
		this.server.to(`user-${dto.userId}`).emit('OnLeave', updatedChan);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('Mute')
	async muteUser(
		@MessageBody() dto: MuteUserDto,
	) {
		const updatedChanUser = await this.channelService.muteUser(dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUserUpdate', updatedChanUser);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('UnMute')
	async unMuteUser(
		@MessageBody() dto: MuteUserDto,
	) {
		const updatedChanUser = await this.channelService.unMuteUser(dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUserUpdate', updatedChanUser);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('ChangeRole')
	async changeUserRole(
		@GetChannelUser() chanUser: ChannelUser,
		@MessageBody() dto: ChangeRoleDto,
	) {
		const info = await this.channelService.changeUserRole(chanUser, dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUserUpdate', info.userChanged);
		if (info.ownerPassed)
			this.server.to(`channel-${dto.chanId}`).emit('ChannelUserUpdate', info.chanUser);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard)
	@SubscribeMessage('OnTypingChannel')
	async onTypingChannel(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: OnTypingChannelDto,
	) {
		socket.to(`channel-${dto.chanId}`).emit('OnTypingChannel', { user, isTyping: dto.isTyping });
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('OnTypingPrivate')
	async onTypingPrivate(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: OnTypingPrivateDto,
	) {
		socket.to(`user-${dto.userId}`).emit('OnTypingPrivate', { user, isTyping: dto.isTyping, convId: dto.convId });
	}
}