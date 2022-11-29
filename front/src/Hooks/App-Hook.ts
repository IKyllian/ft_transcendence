import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { socketUrl } from "../env";
import { NotificationInterface } from "../Types/Notification-Types";
import { addNotification, deleteNotification } from "../Redux/NotificationSlice";
import { addChannel, addPrivateConv, removeChannel } from "../Redux/ChatSlice";
import { Channel, ChannelUpdateType, ChannelUser, Conversation, UserTimeout } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";
import { copyFriendListArray, logoutSuccess, stopIsConnectedLoading } from "../Redux/AuthSlice";
import { GameMode, PartyInterface, PartyMessage } from "../Types/Lobby-Types";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { addParty, addPartyInvite, addPartyMessage, cancelQueue, changePartyGameMode, changeQueueStatus, incrementQueueTimer, leaveParty, removePartyInvite, resetQueueTimer } from "../Redux/PartySlice";
import { fetchVerifyToken } from "../Api/Sign/Sign-Fetch";
import { addChannelUser, banChannelUser, muteChannelUser, removeTimeoutChannelUser, removeChannelUser, setChannelDatas, updateChannelUser, unsetChannelDatas, unsetChannelId } from "../Redux/ChannelSlice";
import { fetchGetAvatar } from "../Api/Profile/Profile-Fetch";

export function useAppHook() {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [cache, setCache] = useState<Cache | undefined | null>(undefined);
	const [eventError, setEventError] = useState<string | undefined>(undefined);
    const { token, isAuthenticated, currentUser } = useAppSelector((state) => state.auth);
	const { party, chatIsOpen, isInQueue } = useAppSelector(state => state.party);
	const { currentChannelId } = useAppSelector((state) => state.channel);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const closeEventError = () => {
		setEventError(undefined);
	}

	const connectSocket = () => {
		const newSocket: Socket = io(`${socketUrl}`, {extraHeaders: {
			"Authorization": `Bearer ${token}`,
		}});
		setSocket(newSocket);
	}

	const openCache = async () => {
		if ('caches' in window) {
			caches.open('avatar-cache').then(cache => {
				setCache(cache);
			})
			.catch(err => {
				console.log(err);
				setCache(null);
			})
		} else {
			setCache(null);
			console.log("Caches not supported");
		}
	}

	const deleteCache = () => {
		console.log("DELETE");
		caches.delete('avatar-cache').then(isGone => {
			console.log("Cache is delete", isGone);
		})
		.catch(err => {
			console.log("ERR", err);
		})
	}

	useEffect(() => {
		console.log("GET ITEM");
		const localToken: string | null = localStorage.getItem("userToken");
		if (localToken !== null) {
			fetchVerifyToken(localToken, dispatch);
		} else {
			dispatch(stopIsConnectedLoading());
		}
	}, [])

	useEffect(() => {
        if (isInQueue) {
            setInterval(() => {
                dispatch(incrementQueueTimer());
            }, 1000)
        } else {
            dispatch(resetQueueTimer());
        }
    }, [isInQueue])

	useEffect(() => {
		if (isAuthenticated && socket === undefined) {
			localStorage.setItem("userToken", token);
			connectSocket();
			// deleteCache();
			openCache();
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (currentUser && currentChannelId !== undefined) {
			socket?.emit("JoinChannelRoom", {
                id: currentChannelId,
            });

			socket?.on('ChannelUpdate', (data: {type: ChannelUpdateType, data: ChannelUser | UserTimeout | number}) => {
                console.log("ChannelUpdate", data);
                if (data.type === ChannelUpdateType.JOIN) {
                    const eventData = data.data as ChannelUser;
                    dispatch(addChannelUser(eventData));
                } else if (data.type === ChannelUpdateType.LEAVE) {
                    const eventData = data.data as number;
                    dispatch(removeChannelUser(eventData));
                } else if (data.type === ChannelUpdateType.BAN) {
                    const eventData = data.data as UserTimeout;
                    dispatch(banChannelUser(eventData));
                } else if (data.type === ChannelUpdateType.MUTE) {
                    const eventData = data.data as UserTimeout;
					dispatch(muteChannelUser(eventData));
                } else if (data.type === ChannelUpdateType.UNTIMEOUT) {
                    const eventData = data.data as number;
					dispatch(removeTimeoutChannelUser(eventData));
                } else if (data.type === ChannelUpdateType.CHANUSER) {
                    const eventData = data.data as ChannelUser;
                    dispatch(updateChannelUser(eventData));
                }
            });

			socket?.on('roomData', (data: Channel) => {
                if (data.id === currentChannelId) {
                    dispatch(setChannelDatas({channel: data, loggedUserId: currentUser.id}));
                }
            });
		}
	}, [currentChannelId]);

	useEffect(() => {
		if (socket && currentChannelId !== undefined && !location.pathname.includes("/chat")) {
            socket.emit("LeaveChannelRoom", {
                id: currentChannelId,
            });
            socket.off("roomData");
            socket.off("ChannelUpdate");
			socket.off("StatusUpdate");
            dispatch(unsetChannelDatas());
			dispatch(unsetChannelId());
        }
	}, [location.pathname, socket])

	useEffect(() => {
		if (socket !== undefined) {
			console.log("SOCKET CONDITION");
			socket.on("Connection", (data: {friendList: UserInterface[], notification: NotificationInterface[], party: PartyInterface}) => {
				console.log("data connection", data);
				dispatch(copyNotificationArray(data.notification));
				dispatch(copyFriendListArray(data.friendList));
				if (data.party) {
					dispatch(addParty(data.party));
				}	
			});

			socket.on("PartyUpdate", (data: {party: PartyInterface, cancelQueue: boolean}) => {
				console.log("PartyUpdate", data);
				dispatch(addParty(data.party));
				dispatch(cancelQueue(data.cancelQueue));
			});

			socket.on("NewPartyMessage", (data: PartyMessage) => {
				dispatch(addPartyMessage(data));
			});

			socket.on("GameModeUpdate", (data: GameMode) => {
				dispatch(changePartyGameMode(data));
			})

			socket.on("PartyLeave", () => {
				console.log("PartyLeave");
				dispatch(leaveParty());
			});

			socket.on("InQueue", (data: boolean) => {
				dispatch(changeQueueStatus(data));
			})

			socket.on("NewNotification", (data: NotificationInterface) => {
				console.log("NewNotification", data);
				dispatch(addNotification(data));
			});

			socket.on("NewPartyInvite", (data: NotificationInterface) => {
				console.log("NewPartyInvite", data);
				dispatch(addPartyInvite(data));
				setTimeout(() => {
					dispatch(removePartyInvite(data.id));
				}, 15000);
			});

			socket.on("DeleteNotification", (data: number) => {
				dispatch(deleteNotification(data));
			});

			socket.on("exception", (data) => {
				console.log(data);
				setEventError(data.message);
			});

			socket.on("FriendListUpdate", (data: UserInterface[]) => {
				console.log("FriendListUpdate", data);
				dispatch(copyFriendListArray(data));
			});

			socket.on("NewConversation", (data : {conv: Conversation, socketId: string}) => {
				console.log("NewConversation", data);
				dispatch(addPrivateConv({isActive: 'false', conversation: {id: data.conv.id, user1: data.conv.user1, user2: data.conv.user2}}));
				if (data.socketId === socket.id)
					navigate(`/chat/private-message/${data.conv.id}`);
			});

			socket.on("OnJoin", (data: Channel) => {
				console.log("ON JOIN");
				dispatch(addChannel({isActive: 'true', channel: data}));
				navigate(`/chat/channel/${data.id}`);
			});

            socket?.on("OnLeave", (data: Channel) => {
                console.log("OnLeave");
				
                // Sert à ne pas redirect si le user est sur une autre page que le channel leave (pour le multitab)
                // Si on veut faire ca il faut que j'envoie l'url ou juste le params du channel à l'event LeaveChannel et que Jojo me le revoie sur cet event
                // if (params.channelId && parseInt(params.channelId) === data.id) {
                    navigate(`/chat`);
                // }
                dispatch(removeChannel(data.id));
            });

			socket.on("Logout", () => {
				socket.disconnect();
				setSocket(undefined);
				localStorage.removeItem("userToken");
				dispatch(logoutSuccess());
			});
		}

		return () => {
			socket?.off("Connection");
			socket?.off("NewNotification");
			socket?.off("NewConversation");
			socket?.off("PartyUpdate");
			socket?.off("InQueue");
			socket?.off("PartyLeave");
			socket?.off("NewPartyInvite");
			socket?.off("FriendListUpdate");
			socket?.off("DeleteNotification");
			socket?.off("exception");
			socket?.off("OnJoin");
			socket?.off("OnLeave");
			socket?.off("Logout");
		}
	}, [socket])

    return {
        socket,
		cache,
        eventError,
        closeEventError,
		isAuthenticated,
		partyState: {
			party,
			chatIsOpen,
		}
    };
}