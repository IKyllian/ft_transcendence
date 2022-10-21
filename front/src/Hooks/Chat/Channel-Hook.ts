import { useEffect, useState, useRef, useContext, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Channel, ChannelUser } from "../../Types/Chat-Types";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { SocketContext } from "../../App";
import { addChannel } from "../../Redux/ChatSlice";
import { UserInterface } from "../../Types/User-Types";
import { debounce } from "../../Utils/Utils-Chat";

export function useChannelHook() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(true);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);
    const [hasSendTypingEvent, setHasTypingEvent] = useState<boolean>(false);
    const [usersTyping, setUsersTyping] = useState<UserInterface[]>([]);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let authDatas = useAppSelector((state) => state.auth);
    let {channels} = useAppSelector((state) => state.chat);
    const params = useParams();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;
    const dispatch = useAppDispatch();

    useEffect(() => {
        console.log("useEffect hasSendTypingEvent", hasSendTypingEvent);
    }, [hasSendTypingEvent])

    const changeSidebarStatus = () => {
        setShowUsersSidebar(!showUsersSidebar);
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    const handleInputChange = (value: string) => {
        if (!hasSendTypingEvent) {
            console.log("Send Emit is Typing True");
            socket?.emit("OnTypingChannel", {
                chanId: channelId,
                isTyping: true,
            })
            setHasTypingEvent(true);
        }
        setInputMessage(value);
    }

    const endOfTyping = () => {
        console.log("Send Emit is Typing False", hasSendTypingEvent);
        socket?.emit("OnTypingChannel", {
            chanId: channelId,
            isTyping: false,
        })
        setHasTypingEvent(false);
    }

    const optimizedFn = useCallback(debounce(endOfTyping), [hasSendTypingEvent, channelId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatDatas?.messages]);

    useEffect(() => {
        setChatDatas(undefined);
        setLoggedUserIsOwner(false);
        setUsersTyping([]);
        setInputMessage('');
        const getDatas = () => {
            socket!.emit("JoinChannelRoom", {
                id: channelId,
            });

            socket?.on("OnTypingChannel", (data: {user: UserInterface, isTyping: boolean}) => {
                setUsersTyping(prev => [...prev.filter(elem => elem.id !== data.user.id)]);
                if (data.isTyping)
                    setUsersTyping(prev => [...prev, data.user]);
            });

            socket!.on('ChannelUsersUpdate', (data: Channel) => {
                setChatDatas((prev: any) => {
                    return {...prev, channelUsers: [...data.channelUsers]}
                });
            });

            socket!.on("ChannelUserUpdate", (data: ChannelUser) => {
                setChatDatas((prev: any) => {
                    return {...prev, channelUsers: [...prev.channelUsers.map((elem: any) => {
                        if (elem.user.id === data.user.id)
                            return elem = data;
                        return elem
                    })] }
                });
            })

            socket!.on('roomData', (data: Channel) => {
                console.log("roomData", data);
                if (data.id === channelId) {
                    let channel: Channel = data;
                    channel.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
                    setChatDatas(channel);
                    if (!channels?.find(elem => elem.channel.id === channel.id))
                        dispatch(addChannel({isActive: 'true', channel: {id: data.id, name: data.name, option: data.option}}));
                    if (data.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                        setLoggedUserIsOwner(true);
                }
            });
        }
        if (channelId) {
            getDatas();
        }

        return () => {
            socket!.emit("LeaveChannelRoom", {
                id: channelId,
            });
            socket!.off("roomData");
            socket!.off("ChannelUsersUpdate");
            socket!.off("ChannelUserUpdate");
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
            socket?.emit("OnTypingChannel", {
                chanId: channelId,
                isTyping: false,
            })
            setHasTypingEvent(false);
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
        optimizedFn: optimizedFn,
        handleInputChange: handleInputChange,
        usersTyping: usersTyping,
    };
}