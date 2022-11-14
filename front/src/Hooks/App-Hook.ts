import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { socketUrl } from "../env";
import { NotificationInterface } from "../Types/Notification-Types";
import { addNotification, deleteNotification } from "../Redux/NotificationSlice";
import { addChannel, addPrivateConv, removeChannel } from "../Redux/ChatSlice";
import { Channel, Conversation } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";
import { copyFriendListArray, stopIsConnectedLoading } from "../Redux/AuthSlice";
import { GameMode, PartyInterface } from "../Types/Lobby-Types";
import { copyNotificationArray } from "../Redux/NotificationSlice";
import { addParty, cancelQueue, changePartyGameMode, changeQueueStatus, leaveParty } from "../Redux/PartySlice";
import { fetchVerifyToken } from "../Api/Sign/Sign-Fetch";

export function useAppHook() {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
	const [gameInvite, setGameInvite] = useState<NotificationInterface | undefined>(undefined);
	const [eventError, setEventError] = useState<string | undefined>(undefined);
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
    const params = useParams();

	const closeEventError = () => {
		setEventError(undefined);
	}

	const connectSocket = () => {
		const newSocket: Socket = io(`${socketUrl}`, {extraHeaders: {
			"Authorization": `Bearer ${token}`,
		}});
		setSocket(newSocket);
	}

	const gameNotificationLeave = () => {
		setGameInvite(undefined);
	}

	useEffect(() => {
		console.log("GET ITEM");
		const localToken: string | null = localStorage.getItem("userToken");
		if (localToken !== null) {
			fetchVerifyToken(localToken, dispatch);
		}
	}, [])

	useEffect(() => {
		if (isAuthenticated && socket === undefined) {
			console.log("SET SOCKET");
			localStorage.setItem("userToken", token);
			connectSocket();
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (socket !== undefined) {
			console.log("SOCKET CONDITION");
			socket.on("Connection", (data: {friendList: UserInterface[], notification: NotificationInterface[], party: PartyInterface}) => {
				console.log("data connection", data);
				dispatch(copyNotificationArray(data.notification));
				dispatch(copyFriendListArray(data.friendList));
				if (data.party)
					dispatch(addParty(data.party));
			});

			socket.on("PartyUpdate", (data: {party: PartyInterface, cancelQueue: boolean}) => {
				console.log("PartyUpdate", data);
				dispatch(addParty(data.party));
				dispatch(cancelQueue(data.cancelQueue));
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
				console.log("NewNotification", data);
				dispatch(addNotification(data));
			});

			socket.on("NewPartyInvite", (data: NotificationInterface) => {
				console.log("NewPartyInvite", data);
				setGameInvite(data);
				setTimeout(function() {
					setGameInvite(undefined);
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
		}
	}, [socket])

    return {
        socket,
        eventError,
        closeEventError,
        gameInvite,
        gameNotificationLeave,
		isAuthenticated,
    };
}