import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { NotificationInterface } from "../Types/Notification-Types";
import { addNotification, deleteNotification, resetNotification } from "../Redux/NotificationSlice";
import { addChannel, addPrivateConv, changePrivateConvOrder, removeChannel, resetChat } from "../Redux/ChatSlice";
import { Channel, ChannelUpdateType, ChannelUser, Conversation, UserTimeout } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";
import { changeFriendListInGameStatus, changeInGameStatus, copyFriendListArray, logoutSuccess, stopIsConnectedLoading, userFullAuthenticated } from "../Redux/AuthSlice";
import { GameMode, PartyInterface, PartyMessage } from "../Types/Lobby-Types";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { addParty, addPartyInvite, addPartyMessage, cancelQueue, changeModalStatus, changePartyGameMode, changeQueueStatus, incrementQueueTimer, leaveParty, newGameFound, removePartyInvite, resetParty, resetQueueTimer } from "../Redux/PartySlice";
import { fetchVerifyToken } from "../Api/Sign/Sign-Fetch";
import { addChannelUser, banChannelUser, muteChannelUser, removeTimeoutChannelUser, removeChannelUser, setChannelDatas, updateChannelUser, unsetChannelDatas, unsetChannelId, channelNotfound, resetChannel, updateChannelUserIngameStatus } from "../Redux/ChannelSlice";
import { addAlert, AlertType, resetAlert } from "../Redux/AlertSlice";
import { PlayersGameData } from "../Components/Game/game/types/shared.types";
import { TokenStorageInterface } from "../Types/Utils-Types";
import { changeUserIngameStatus, resetConvState } from "../Redux/PrivateConvSlice";
import axios from "axios";
import { lockForm } from "../Redux/LobbySlice";

export function useAppHook() {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [cache, setCache] = useState<Cache | undefined | null>(undefined);
	const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | undefined>(undefined)
    const { isAuthenticated, currentUser, displayQRCode, isSign } = useAppSelector((state) => state.auth);
	const { modalIsOpen } = useAppSelector(state => state.party);
	const { party, chatIsOpen, isInQueue } = useAppSelector(state => state.party);
	const { currentChannelId } = useAppSelector((state) => state.channel);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const connectSocket = (access_token: string) => {
		const newSocket: Socket = io(`${process.env.REACT_APP_SOCKET_URL}`, {extraHeaders: {
			"Authorization": `Bearer ${access_token}`,
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

	const logout = () => {
		if (socket)
			socket.disconnect();
		setSocket(undefined);
		localStorage.removeItem("userToken");
		dispatch(resetParty());
		dispatch(resetChannel());
		dispatch(resetChat());
		dispatch(resetConvState());
		dispatch(resetNotification());
		dispatch(resetAlert());
		dispatch(logoutSuccess());
	}

	const deleteCache = () => {
		caches.delete('avatar-cache').then(isGone => {
			console.log("Cache deleted", isGone);
		})
		.catch(err => {
			console.log("ERR", err);
		})
	}
	
	useEffect(() => {
		// localStorage.removeItem("userToken");
		if (localStorage.getItem("userToken") !== null) {
			fetchVerifyToken(dispatch);
		} else {
			dispatch(stopIsConnectedLoading());
		}
	}, [])

	useEffect(() => {
        if (isInQueue) {
            setIntervalId(setInterval(() => {
                dispatch(incrementQueueTimer());
            }, 1000))
        } else {
			if (intervalId) {
				clearInterval(intervalId);
				setIntervalId(undefined);
			}
            dispatch(resetQueueTimer());
        }

		return () => {
			clearInterval(intervalId);
		}
    }, [isInQueue])

	useEffect(() => {
		if (!isAuthenticated && isSign && socket === undefined) {
			// localStorage.setItem("userToken", token);
			const localToken: string | null = localStorage.getItem("userToken");
			if (localToken !== null) {
				const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
				connectSocket(localTokenParse.access_token);
				// deleteCache();
				openCache();
			}
		}
	}, [isSign, socket])

	useEffect(() => {
		if (currentUser && currentChannelId !== undefined) {
			socket?.emit("JoinChannelRoom", {
                id: currentChannelId,
            });

			socket?.on('ChannelUpdate', (data: {type: ChannelUpdateType, data: ChannelUser | UserTimeout | number}) => {
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
                    dispatch(updateChannelUser({user: eventData, loggedUserId: currentUser.id}));
                }
            });

			socket?.on('roomData', (data: Channel) => {
                if (data.id === currentChannelId) {
                    dispatch(setChannelDatas({channel: data, loggedUserId: currentUser.id}));
                }
            });
		}
	}, [currentChannelId, socket]);

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
		if (modalIsOpen)
			dispatch(changeModalStatus(false));
	}, [location.pathname, socket])

	useEffect(() => {
		if (socket !== undefined) {
			socket.on("Connection", (data: {friendList: UserInterface[], notification: NotificationInterface[], party: PartyInterface}) => {
				dispatch(copyNotificationArray(data.notification));
				dispatch(copyFriendListArray(data.friendList));
				if (data.party) {
					dispatch(addParty(data.party));
				}
				dispatch(userFullAuthenticated());
			});

			socket.on("PartyUpdate", (data: {party: PartyInterface, cancelQueue: boolean}) => {
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
				dispatch(leaveParty());
			});

			socket.on("InQueue", (data: boolean) => {
				dispatch(changeQueueStatus(data));
			})

			socket.on("NewNotification", (data: NotificationInterface) => {
				if (data.conversation) {
					dispatch(changePrivateConvOrder(data.conversation.id));
				}
				dispatch(addNotification(data));
			});

			socket.on("NewPartyInvite", (data: NotificationInterface) => {
				dispatch(addPartyInvite(data));
				setTimeout(() => {
					dispatch(removePartyInvite(data.id));
				}, 15000);
			});

			socket.on("DeleteNotification", (data: number) => {
				dispatch(deleteNotification(data));
			});

			socket.on("exception", (data: {message: string, status: string}) => {
				dispatch(addAlert({message: data.message, type: AlertType.ERROR}));
				if (data.message === "Channel not found" && data.status === "error")
					dispatch(channelNotfound());
			});

			socket.on("FriendListUpdate", (data: UserInterface[]) => {
				dispatch(copyFriendListArray(data));
			});

			socket.on("NewConversation", (data : {conv: Conversation, socketId: string}) => {
				dispatch(addPrivateConv({isActive: 'false', conversation: {id: data.conv.id, user1: data.conv.user1, user2: data.conv.user2}}));
				if (data.socketId === socket.id)
					navigate(`/chat/private-message/${data.conv.id}`);
			});

			socket.on("OnJoin", (data: {channel: Channel, socketId: string}) => {
				dispatch(addChannel({isActive: 'true', channel: data.channel}));
				if (data.socketId === socket.id)
					navigate(`/chat/channel/${data.channel.id}`);
			});

			socket?.on("InGameStatusUpdate", (data: {id: number, in_game_id: string | null}) => {
				if (currentUser && currentUser.id === data.id) {
					dispatch(changeInGameStatus(data.in_game_id));
				}
				dispatch(changeFriendListInGameStatus({id: data.id, in_game_id: data.in_game_id}));
				dispatch(updateChannelUserIngameStatus({id: data.id, in_game_id: data.in_game_id}));
				dispatch(changeUserIngameStatus({id: data.id, in_game_id: data.in_game_id}));				
			});

			socket?.on("SendConfirm", (data: string) => {
				dispatch(addAlert({message: data, type: AlertType.SUCCESS}));
			});

			socket?.on("newgame_data", (data: PlayersGameData) => {
				dispatch(lockForm(true));
				dispatch(newGameFound({gameDatas: data, showGameFound: true}));
			});

			socket?.on('gameinfo', (data: PlayersGameData | null) => {
				if (data !== null) {
					socket?.emit("StopQueue");
					dispatch(newGameFound({gameDatas: data, showGameFound: false}));
					navigate("/game", {state: data});
				}
			})

			socket?.on('user_gameinfo', (data: PlayersGameData | null) => {
				if (data !== null) {
					dispatch(newGameFound({gameDatas: data, showGameFound: false}));
					navigate("/game", {state: data});
				}
			})

			socket?.on("Unauthorized", async () => {
				const localToken: string | null = localStorage.getItem("userToken");
				if (localToken) {
					const storedToken: TokenStorageInterface = JSON.parse(localToken);
					try {
						const refreshResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/refresh`, {}, {
							headers: {
								"Authorization": `Bearer ${storedToken.refresh_token}`,
							}
						});
						if (refreshResponse && refreshResponse.data) {
							localStorage.setItem("userToken", JSON.stringify(refreshResponse.data));
							const newSocket: Socket = io(`${process.env.REACT_APP_SOCKET_URL}`, {extraHeaders: {
								"Authorization": `Bearer ${refreshResponse.data.access_token}`,
							}});
							setSocket(newSocket);
						}
					} catch (_err) {
						socket?.emit("Logout");
					}
				}
			})

			socket.on("Logout", () => {
				logout();
			});
		}

		return () => {
			if (socket) {
				socket?.off("Connection");
				socket?.off("PartyUpdate");
				socket?.off("NewPartyMessage");
				socket?.off("GameModeUpdate");
				socket?.off("PartyLeave");
				socket?.off("InQueue");
				socket?.off("NewNotification");
				socket?.off("NewPartyInvite");
				socket?.off("DeleteNotification");
				socket?.off("exception");
				socket?.off("FriendListUpdate");
				socket?.off("NewConversation");
				socket?.off("OnJoin");
				socket?.off("InGameStatusUpdate");
				socket?.off("SendConfirm");
				socket?.off("newgame_data");
				socket?.off("gameinfo");
				socket?.off("user_gameinfo");
				socket?.off("Unauthorized");
				socket?.off("Logout");
				socket.disconnect();
			}
		}
	}, [socket])

	useEffect(() => {
		if (socket !== undefined) {
			socket?.on("OnLeave", (data: number) => {		
                if (currentChannelId !== undefined && +currentChannelId === data)
                    navigate(`/chat`);
                dispatch(removeChannel(data));
            });
		}
		return () => {
			if (socket !== undefined)
				socket.off("OnLeave");
		}

	}, [socket, currentChannelId])

    return {
        socket,
		cache,
		displayQRCode,
		isAuthenticated,
		isSign,
		partyState: {
			party,
			chatIsOpen,
		},
		logout,
    };
}