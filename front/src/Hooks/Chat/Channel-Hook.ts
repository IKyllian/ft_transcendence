import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { PreviousMessagesState, ChatMessage, defaultMessagesState } from "../../Types/Chat-Types";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { SocketContext } from "../../App";
import { UserInterface } from "../../Types/User-Types";
import { debounce } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";
import { fetchLoadPrevChatMessages } from "../../Api/Chat/Chat-Action";
import { addChannelMessage } from "../../Redux/ChannelSlice";

export function useChannelHook() {
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(true);
    const [hasSendTypingEvent, setHasTypingEvent] = useState<boolean>(false);
    const [previousMessages, setPreviousMessages] = useState<PreviousMessagesState>(defaultMessagesState);
    const { register, handleSubmit, setValue } = useForm<{inputMessage: string}>();
    const [usersTyping, setUsersTyping] = useState<UserInterface[]>([]);
    const [haveToLoad, setHaveToLoad] = useState<boolean>(false);
    const [prevLength, setPrevLength] = useState<number>(0);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const {channelDatas, loggedUserIsOwner} = useAppSelector((state) => state.channel);
    const params = useParams();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? +params.channelId! : undefined;
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
        if (channelId && channelDatas && e && e.target && e.target.scrollTop < 5 && !previousMessages.reachedMax && !previousMessages.loadPreviousMessages && !haveToLoad) {
            setHaveToLoad(true);            
        }
    }

    useEffect(() => {
        if (haveToLoad && channelId && channelDatas && !previousMessages.loadPreviousMessages && !previousMessages.reachedMax) {
            setPreviousMessages(prev => { return {...prev, loadPreviousMessages: true}});
            fetchLoadPrevChatMessages(channelId, dispatch, channelDatas?.messages, setPreviousMessages);
        }
    }, [haveToLoad])

    const scrollToBottom = () => {
        // Permet de check si la div du chat est scrollable. Si elle ne l'est pas, load des datas pour que la div devienne scrollable
        var div = document.getElementsByClassName('chat-messages-wrapper');
        if (div.length > 0){
            var hasVerticalScrollbar = div[0].scrollHeight > div[0].clientHeight;
            if (!hasVerticalScrollbar && channelId && channelDatas) {
                fetchLoadPrevChatMessages(channelId, dispatch, channelDatas?.messages, setPreviousMessages);
            }
        } 
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        if (!previousMessages.loadPreviousMessages && channelDatas) {
            scrollToBottom();
            setPrevLength(channelDatas.messages.length);
        } else if (channelDatas) {
            const scrollToMessage = document.getElementById("chat-message-wrapper")?.getElementsByTagName('li');
            if (scrollToMessage && scrollToMessage.length > 0)
                scrollToMessage[channelDatas.messages.length - prevLength].scrollIntoView();
            setPrevLength(channelDatas.messages.length);
            setPreviousMessages((prev: PreviousMessagesState) => { return {...prev, loadPreviousMessages: false}});
            setHaveToLoad(false);
        }
    }, [channelDatas?.messages]);

    useEffect(() => {
        setUsersTyping([]);
        setPreviousMessages(defaultMessagesState);
        setHaveToLoad(false);
        setPrevLength(0);

        const listener = (data: ChatMessage) => {
            dispatch(addChannelMessage(data));
        }

        const getDatas = () => {
            socket?.on('NewChannelMessage', listener);
    
            socket?.on("OnTypingChannel", (data: {user: UserInterface, isTyping: boolean}) => {
                setUsersTyping(prev => [...prev.filter(elem => elem.id !== data.user.id)]);
                if (data.isTyping)
                    setUsersTyping(prev => [...prev, data.user]);
            });

        }

        if (channelId && socket) {
            getDatas();
        }

        return () => {
            if (channelId && socket) {
                socket?.off("OnTypingChannel");
                socket?.off("NewChannelMessage");
            }
        }
    }, [channelId, socket])

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
            setValue("inputMessage", "");
        }
    })

    return {
        loggedUserIsOwner,
        changeSidebarStatus,
        handleSubmit: handleSubmitMessage,
        messagesEndRef,
        showUsersSidebar,
        channelDatas,
        optimizedFn,
        handleInputChange,
        usersTyping,
        register,
        handleOnScroll,
        previousMessages,
    };
}