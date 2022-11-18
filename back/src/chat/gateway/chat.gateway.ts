import { BadRequestException, NotFoundException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/guard/ws-jwt.guard';
import { ChannelUser, Notification, User, UserTimeout } from 'src/typeorm';
import { ChannelService } from '../channel/channel.service';
import { UserService } from 'src/user/user.service';
import { ChannelUpdateType, JwtPayload, notificationType, UserStatus } from 'src/utils/types/types';
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
import { ChanIdDto } from '../channel/dto/chan-id.dto';
import { GlobalService } from 'src/utils/global/global.service';

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
		private privateMsgService: PrivateMessageService,
		private channelMsgService: ChannelMessageService,
		private authService: AuthService,
		private channelService: ChannelService,
		private userService: UserService,
		private friendshipService: FriendshipService,
		private notificationService: NotificationService,
		private convService: ConversationService,
		private partyService: PartyService,
		private globalService: GlobalService,
		) {}

	afterInit(server: Server) {
			// console.log(this.server)
			this.globalService.server = server;
	}

	async handleConnection(socket: AuthenticatedSocket) {
		let user: User = null;
		if (socket.handshake.headers.authorization) {
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
		// console.log("USER", user);
		console.log(user.username, 'connected')
		this.server.to(socket.id).emit('StatusUpdate', user);
		socket.join(`user-${user.id}`);
		if (user.status === UserStatus.OFFLINE) {
			this.userService.setStatus(user, UserStatus.ONLINE);
		}
		socket.emit('Connection', {
			friendList: await this.friendshipService.getFriendlist(user),
			notification: await this.notificationService.getNotifications(user),
			party: this.partyService.partyJoined.getParty(user.id),
		});
	}

	async handleDisconnect(socket: Socket) {
		if (socket.handshake.headers.authorization) {
			const payload = this.authService.decodeJwt(socket.handshake.headers.authorization.split(' ')[1]) as JwtPayload;
			const user = await this.userService.findOneBy({ id: payload?.sub });
			if (user) {
				this.userService.setStatus(user, UserStatus.OFFLINE);
				// socket.emit('statusUpdate', { user, status: 'offline' });
				console.log(payload?.username, 'disconnected');
			}
			} else
				console.log(socket.id, 'disconnected');
			// TODO emit disconnected for front retry to reconnect ?
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('Logout')
	async logout(@GetUser() user: User) {
		console.log("logout")
		await this.authService.logout(user);
		this.server.to(`user-${user.id}`).emit('Logout');
	}

	/* ------------------------------------ */
	/* ---------- CHANNEL SECTION --------- */
	/* ------------------------------------ */

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinChannel')
	async joinChannel(
		@GetUser() user: User,
		@MessageBody() channel: RoomDto,
		@MessageBody() pwdDto?: ChannelPasswordDto,
	) {
		const channelUser = await this.channelService.join(user, channel.id, pwdDto);
		this.server.to(`channel-${channel.id}`).emit('ChannelUpdate', { type: ChannelUpdateType.JOIN, data: channelUser });
		this.server.to(`user-${user.id}`).emit('OnJoin', channelUser.channel);
		const servMsg = await this.channelMsgService.createServer({
			chanId: channelUser.channelId,
			content: `Welcome ${user.username}, say hi!`,
		});
		this.server.to(`channel-${channel.id}`).emit('NewChannelMessage', servMsg);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard)
	@SubscribeMessage('LeaveChannel')
	async leaveChannel(
		@GetChannelUser() chanUser: ChannelUser,
		@MessageBody() channel: ChanIdDto,
	) {
		await this.channelService.leave(chanUser);
		this.server.to(`channel-${channel.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.LEAVE, data: chanUser.id});
		this.server.to(`user-${chanUser.userId}`).emit('OnLeave', channel.chanId);
		const servMsg = await this.channelMsgService.createServer({
				chanId: channel.chanId,
				content: `${chanUser.user.username} just left.`,
		});
		this.server.to(`channel-${channel.chanId}`).emit('NewChannelMessage', servMsg);
	}

	/**
	 * Make user socket join the channel room and send channel information
	 * to him. If user got channel message notification, it get remove from database
	 * and user client is notified with an emit
	 * @param socket
	 * @param room = channel id
	 */
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinChannelRoom')
	async joinChannelRoom(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@GetUser() user: User,
		@MessageBody() room: RoomDto,
	) {
		console.log(socket.user.username + ' joined room')
		const chanInfo = await this.channelService.getChannelById(user.id, room.id);
		socket.emit('roomData', chanInfo);
		socket.join(`channel-${ chanInfo.id }`);
		const deletedNotifId = await this.notificationService.deleteChannelMessageNotif(user.id, room.id);
		if (deletedNotifId) {
			this.server.to(`user-${user.id}`).emit('DeleteNotification', deletedNotifId);
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

	@UseGuards(WsJwtGuard, WsInChannelGuard)
	@SubscribeMessage('ChannelMessage')
	async sendChannelMessage(
		@MessageBody() data: ChannelMessageDto,
		@GetChannelUser() chanUser: ChannelUser,
		) {
			await this.channelService.isMuted(chanUser);
			const message = await this.channelMsgService.create(chanUser, data);
			this.server.to(`channel-${ data.chanId }`).emit('NewChannelMessage', message);
			this.notificationService.sendMessageNotif(data.chanId);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard)
	@SubscribeMessage('ChannelInvite')
	async channelInvite(
		@GetUser() user: User,
		@MessageBody() dto: ChannelInviteDto,
	) {
		const notif: Notification = await this.notificationService.createChanInviteNotif(user, dto);
		this.server.to(`user-${dto.userId}`).emit('NewNotification', notif);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('ChannelInviteResponse')
	async respondToChannelInvite(
		@GetUser() user: User,
		@MessageBody() dto: ResponseDto,
	) {
		const chanUser: ChannelUser = await this.channelService.respondInvite(user, dto);
		if (chanUser) {
			this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.JOIN, data: chanUser });
			this.server.to(`user-${user.id}`).emit('OnJoin', chanUser.channel);
		}
		this.server.to(`user-${user.id}`).emit('DeleteNotification', dto.id);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('Ban')
	async banUser(
		@GetChannelUser() chanUser: ChannelUser,
		@MessageBody() dto: BanUserDto,
	) {
		console.log("banning", dto)
		const bannedUser: UserTimeout = await this.channelService.banUser(chanUser, dto);
		this.server.to(`channel-${bannedUser.channel.id}`).emit('ChannelUpdate', { type: ChannelUpdateType.BAN, data: bannedUser });
		this.server.to(`user-${dto.userId}`).emit('OnLeave', bannedUser.channel);
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('Unban')
	async unbanUser(
		@MessageBody() dto: BanUserDto,
	) {
		const bannedUser: UserTimeout = await this.channelService.unbanUser(dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNTIMEOUT, data: bannedUser.id });
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('Mute')
	async muteUser(
		@GetChannelUser() chanUser: ChannelUser,
		@MessageBody() dto: MuteUserDto,
	) {
		console.log("in mute", dto)
		const user = await this.channelService.muteUser(chanUser, dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.MUTE, data: user });
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('UnMute')
	async unMuteUser(
		@MessageBody() dto: MuteUserDto,
	) {
		const muted: UserTimeout = await this.channelService.unMuteUser(dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.UNTIMEOUT, data: muted.id });
	}

	@UseGuards(WsJwtGuard, WsInChannelGuard, ChannelPermissionGuard)
	@SubscribeMessage('ChangeRole')
	async changeUserRole(
		@GetChannelUser() chanUser: ChannelUser,
		@MessageBody() dto: ChangeRoleDto,
	) {
		const info = await this.channelService.changeUserRole(chanUser, dto);
		this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.CHANUSER, data: info.userChanged });
		if (info.ownerPassed)
			this.server.to(`channel-${dto.chanId}`).emit('ChannelUpdate', { type: ChannelUpdateType.CHANUSER, data: info.chanUser });
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

	/* -------------------------------------------- */
	/* ---------- PRIVATE MESSAGE SECTION --------- */
	/* -------------------------------------------- */

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('CreateConversation')
	async createConversation(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: PrivateMessageDto,
	) {
		console.log("create conv", data)
		const conv = await this.convService.create(socket.user, data.adresseeId, data.content);
		this.server
		.to(`user-${socket.user.id}`)
		.to(`user-${data.adresseeId}`)
		.emit('NewConversation', { conv, socketId: socket.id });

		this.notificationService.sendPrivateMessageNotif(socket.user.id, conv);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('JoinConversationRoom')
	async joinConvRoom(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() room: RoomDto,
	) {
		console.log(socket.user.username + " joining conversation room");
		const conv = await this.convService.getConversation(socket.user, room.id);
		if (!conv) {
			throw new BadRequestException('Conversation not found');
		}
		socket.join(`conversation-${room.id}`);
		this.server.to(`user-${socket.user.id}`).emit('ConversationData', conv);
		const deletedNotifId = await this.notificationService.deletePrivateMessageNotif(socket.user.id, room.id);
		if (deletedNotifId) {
			this.server.to(`user-${socket.user.id}`).emit('DeleteNotification', deletedNotifId);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('LeaveConversationRoom')
	async leaveConvRoom(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() room: RoomDto,
	) {
		console.log(socket.user.username + " leaving conversation room");
		socket.leave(`conversation-${room.id}`);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('PrivateMessage')
	async sendPrivateMessage(
		@ConnectedSocket() socket: AuthenticatedSocket,
		@MessageBody() data: PrivateMessageDto,
		) {
			const message = await this.privateMsgService.create(socket.user, data);
			this.server
			.to(`conversation-${message.conversation.id}`)
			.emit('NewPrivateMessage', message);
			this.notificationService.sendPrivateMessageNotif(socket.user.id, message.conversation);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('OnTypingPrivate')
	async onTypingPrivate(
		@GetUser() user: User,
		@ConnectedSocket() socket: Socket,
		@MessageBody() dto: OnTypingPrivateDto,
	) {
		//check if in conv
		socket.to(`conversation-${dto.convId}`).emit('OnTypingPrivate', { user: {id: user.id, username: user.username}, isTyping: dto.isTyping, convId: dto.convId });
	}

	/* --------------------------------------- */
	/* ---------- FRIENDSHIP SECTION --------- */
	/* --------------------------------------- */

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
}