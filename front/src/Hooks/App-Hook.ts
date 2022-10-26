import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { socketUrl } from "../env";
import { fetchNotifications, fetchFriendList } from "../Api/User-Fetch";
import { NotificationInterface } from "../Types/Notification-Types";
import { addNotification, deleteNotification } from "../Redux/NotificationSlice";
import { addChannel, addPrivateConv, removeChannel, } from "../Redux/ChatSlice";
import { Channel, Conversation } from "../Types/Chat-Types";
import { UserInterface } from "../Types/User-Types";
import { copyFriendListArray } from "../Redux/AuthSlice";

export function useAppHook() {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
	const [gameInvite, setGameInvite] = useState<boolean>(false);
    const {token, isAuthenticated, currentUser} = useAppSelector((state) => state.auth);
	const [eventError, setEventError] = useState<string | undefined>(undefined);

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
		setGameInvite(false);
	}

	useEffect(() => {
		if (isAuthenticated && socket === undefined) {
			connectSocket();
			fetchNotifications(token, dispatch);
			fetchFriendList(token, dispatch);
			// setTimeout(function() {
			// 	setGameInvite(true);
			// 	setTimeout(function() {
			// 		gameNotificationLeave();
			// 	}, 15000);
			// }, 2000);
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (socket !== undefined) {
			console.log("SOCKET CONDITION");
			socket.on("NewNotification", (data: NotificationInterface) => {
				console.log("NewNotification", data);
				dispatch(addNotification(data));
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
			})

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
			socket?.off("NewNotification");
			socket?.off("NewConversation");
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
        gameNotificationLeave
    };
}