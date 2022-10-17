import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { Channel } from "../../Types/Chat-Types";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { SocketContext } from "../../App";
import { addChannel } from "../../Redux/ChatSlice";

export function useChannelHook() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(true);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let authDatas = useAppSelector((state) => state.auth);
    let {channels} = useAppSelector((state) => state.chat);
    const params = useParams();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;
    const dispatch = useAppDispatch();

    const changeSidebarStatus = () => {
        setShowUsersSidebar(!showUsersSidebar);
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [chatDatas?.messages]);

    useEffect(() => {
        setChatDatas(undefined);
        const getDatas = () => {
            socket!.emit("JoinChannelRoom", {
                id: channelId,
            });

            socket!.on('ChannelUpdate', (data: Channel) => {
                setChatDatas((prev: any) => {
                    return {...prev, channelUsers: [...data.channelUsers]}
                });
                console.log(data);
            });

            socket!.on('exception', (data: any) => {
                console.log(data);
            });

            socket!.on('roomData', (data: Channel) => {
                let channel: Channel = data;
                channel.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
                setChatDatas(channel);
                if (!channels?.find(elem => elem.channel.id === channel.id))
                    dispatch(addChannel({isActive: 'true', channel: data}));
                if (data.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                    setLoggedUserIsOwner(true);
            });
        }
        if (channelId) {
            getDatas();
        }

        return () => {
            socket!.emit("LeaveChannelRoom", {
                id: channelId,
            });
            socket!.off("exception");
            socket!.off("roomData");
            socket!.off("ChannelUpdate");
        }
    }, [channelId])

    useEffect(() => {
        const listener = (data: any) => {
            setChatDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, {...data, send_at: new Date(data.send_at)}]}
            });
        }
        socket!.on('NewChannelMessage', listener);

        return () => {
            socket!.off("NewChannelMessage");
        }
    }, [])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            socket!.emit("ChannelMessage", {
                content: inputMessage,
                chanId: channelId,
            });
            setInputMessage('');
        }
        if (inputMessage.length > 0) {
            submitMessage();
        }
    } 

    return {
        loggedUserIsOwner: loggedUserIsOwner,
        changeSidebarStatus: changeSidebarStatus,
        handleSubmit: handleSubmit,
        messagesEndRef: messagesEndRef,
        inputMessage: inputMessage,
        setInputMessage: setInputMessage,
        showUsersSidebar: showUsersSidebar,
        chatDatas: chatDatas,
    };
}