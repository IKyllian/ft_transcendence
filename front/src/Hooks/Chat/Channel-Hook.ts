import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Channel, ChannelUser, ChannelUpdateType, UserTimeout, PreviousMessagesState } from "../../Types/Chat-Types";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { SocketContext } from "../../App";
import { addChannel } from "../../Redux/ChatSlice";
import { UserInterface } from "../../Types/User-Types";
import { debounce } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";
import { fetchLoadPrevMessages } from "../../Api/Chat/Chat-Action";

const defaultMessagesState: PreviousMessagesState = {
    loadPreviousMessages: false,
    reachedMax: false
}

export function useChannelHook() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(true);
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);
    const [hasSendTypingEvent, setHasTypingEvent] = useState<boolean>(false);
    const [previousMessages, setPreviousMessages] = useState<PreviousMessagesState>(defaultMessagesState);
    const { register, handleSubmit, reset, formState: {errors} } = useForm<{inputMessage: string}>();
    const [usersTyping, setUsersTyping] = useState<UserInterface[]>([]);
    const [haveToLoad, setHaveToLoad] = useState<boolean>(false);
    const [prevLength, setPrevLength] = useState<number>(0);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let authDatas = useAppSelector((state) => state.auth);
    let {channels} = useAppSelector((state) => state.chat);
    const params = useParams();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;
    const dispatch = useAppDispatch();

    const changeSidebarStatus = () => {
        setShowUsersSidebar(!showUsersSidebar);
    };

    const handleInputChange = () => {
        if (!hasSendTypingEvent) {
            socket?.emit("OnTypingChannel", {
                chanId: channelId,
                isTyping: true,
            })
            setHasTypingEvent(true);
        }
    }

    const endOfTyping = () => {
        socket?.emit("OnTypingChannel", {
            chanId: channelId,
            isTyping: false,
        })
        setHasTypingEvent(false);
    }

    const optimizedFn = useCallback(debounce(endOfTyping, 6000), [hasSendTypingEvent, channelId]);

    const handleOnScroll = (e: any) => {
        if (channelId && chatDatas && e && e.target && e.target.scrollTop < 5 && !previousMessages.reachedMax && !previousMessages.loadPreviousMessages && !haveToLoad) {
            setHaveToLoad(true);            
        }
    }

    useEffect(() => {
        if (haveToLoad && channelId && chatDatas && !previousMessages.loadPreviousMessages && !previousMessages.reachedMax) {
            setPreviousMessages(prev => { return {...prev, loadPreviousMessages: true}});
            fetchLoadPrevMessages(channelId, authDatas.token, setChatDatas, chatDatas?.messages, setPreviousMessages);
        }
    }, [haveToLoad])

    const scrollToBottom = () => {
        // Permet de check si la div du chat est scrollable. Si elle ne l'est pas, load des datas pour que la div devienne scrollable
        var div = document.getElementsByClassName('chat-messages-wrapper');
        if (div.length > 0){
            var hasVerticalScrollbar = div[0].scrollHeight > div[0].clientHeight;
            if (!hasVerticalScrollbar && channelId && chatDatas) {
                fetchLoadPrevMessages(channelId, authDatas.token, setChatDatas, chatDatas?.messages, setPreviousMessages);
            }
        } 
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        if (!previousMessages.loadPreviousMessages && chatDatas) {
            scrollToBottom();
            setPrevLength(chatDatas.messages.length);
        } else if (chatDatas) {
            const scrollToMessage = document.getElementById("chat-message-wrapper")?.getElementsByTagName('li');
            if (scrollToMessage && scrollToMessage.length > 0)
                scrollToMessage[chatDatas.messages.length - prevLength].scrollIntoView();
            setPrevLength(chatDatas.messages.length);
            setPreviousMessages((prev: PreviousMessagesState) => { return {...prev, loadPreviousMessages: false}});
            setHaveToLoad(false);
        }
    }, [chatDatas?.messages]);

    useEffect(() => {
        setChatDatas(undefined);
        setLoggedUserIsOwner(false);
        setUsersTyping([]);
        setPreviousMessages(defaultMessagesState);
        setHaveToLoad(false);
        setPrevLength(0);

        const listener = (data: any) => {
            setChatDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, {...data, send_at: new Date(data.send_at)}]}
            });
        }

        const getDatas = () => {
            socket?.emit("JoinChannelRoom", {
                id: channelId,
            });

            socket?.on('NewChannelMessage', listener);
    
            socket?.on("OnTypingChannel", (data: {user: UserInterface, isTyping: boolean}) => {
                console.log("OnTypingChannel");
                setUsersTyping(prev => [...prev.filter(elem => elem.id !== data.user.id)]);
                if (data.isTyping)
                    setUsersTyping(prev => [...prev, data.user]);
            });

            socket?.on('ChannelUpdate', (data: {type: ChannelUpdateType, data: ChannelUser | UserTimeout | number}) => {
                console.log("ChannelUpdate", data);
                if (data.type === ChannelUpdateType.JOIN) {
                    const eventData = data.data as ChannelUser;
                    setChatDatas((prev: any) => {
                        return {...prev, channelUsers: [...prev.channelUsers, eventData]}
                    });
                } else if (data.type === ChannelUpdateType.LEAVE) {
                    const eventData = data.data as number;
                    setChatDatas((prev: any) => {
                        return {...prev, channelUsers: [...prev.channelUsers.filter((elem: ChannelUser) => elem.id !== eventData)]}
                    });
                } else if (data.type === ChannelUpdateType.BAN) {
                    const eventData = data.data as UserTimeout;
                    setChatDatas((prev: any) => {
                        return {...prev, usersTimeout: [...prev.usersTimeout, eventData]}
                    });
                    setChatDatas((prev: any) => {
                        return {...prev, channelUsers: [...prev.channelUsers.filter((elem: ChannelUser) => elem.user.id !== eventData.user.id)]}
                    });
                } else if (data.type === ChannelUpdateType.MUTE) {
                    const eventData = data.data as UserTimeout;
                    setChatDatas((prev: any) => {
                        return {...prev, usersTimeout: [...prev.usersTimeout, eventData]}
                    });
                } else if (data.type === ChannelUpdateType.UNTIMEOUT) {
                    const eventData = data.data as number;
                    setChatDatas((prev: any) => {
                        return {...prev, usersTimeout: [...prev.channelUsers.filter((elem: UserTimeout) => elem.id !== eventData)]}
                    });
                } else if (data.type === ChannelUpdateType.CHANUSER) {
                    const eventData = data.data as ChannelUser;
                    setChatDatas((prev: any) => {
                        return {...prev, channelUsers: [...prev.channelUsers.map((elem: any) => {
                            if (elem.user.id === eventData.user.id)
                                return elem = eventData;
                            return elem
                        })] }
                    });
                }
            });

            socket?.on('roomData', (data: Channel) => {
                console.log("Getting datas roomData", data);
                if (data.id === channelId && channels) {
                    let channel: Channel = data;
                    channel.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
                    setChatDatas(channel);
                    if (!channels?.find(elem => elem.channel.id === channel.id)) {
                        console.log("WWNWNWNWNWNNWNWNWSCNSDKFNSDFNSDNFGSDINFGSIN", channels);
                        dispatch(addChannel({isActive: 'true', channel: {id: data.id, name: data.name, option: data.option}}));
                    }
                    if (data.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                        setLoggedUserIsOwner(true);
                }
            });
        }
        if (channelId && socket) {
            getDatas();
        }

        return () => {
            if (socket) {
                socket?.emit("LeaveChannelRoom", {
                    id: channelId,
                });
                socket?.off("roomData");
                socket?.off("ChannelUpdate");
                socket?.off("OnTypingChannel");
                socket?.off("NewChannelMessage");
            }
        }
    }, [socket, channelId, channels])

    const handleSubmitMessage = handleSubmit((data, e: any) => {
        e.preventDefault();
        if (data.inputMessage.length > 0) {
            socket?.emit("ChannelMessage", {
                content: data.inputMessage,
                chanId: channelId,
            });
            socket?.emit("OnTypingChannel", {
                chanId: channelId,
                isTyping: false,
            })
            setHasTypingEvent(false);
            reset();
        }
    })

    return {
        loggedUserIsOwner,
        changeSidebarStatus,
        handleSubmit: handleSubmitMessage,
        messagesEndRef,
        showUsersSidebar,
        chatDatas,
        optimizedFn,
        handleInputChange,
        usersTyping,
        register,
        handleOnScroll,
        previousMessages,
    };
}