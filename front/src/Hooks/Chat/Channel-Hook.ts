import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { Channel } from "../../Types/Chat-Types";
import { useAppSelector } from '../../Redux/Hooks'
import { SocketContext } from "../../App";

export function useChannelHook() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let authDatas = useAppSelector((state) => state.auth);
    const params = useParams();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;

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

            socket!.on('exception', (data: any) => {
                console.log(data);
            });

            socket!.on('roomData', (data: Channel) => {
                let channel: Channel = data;
                channel.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
                setChatDatas({...channel});
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