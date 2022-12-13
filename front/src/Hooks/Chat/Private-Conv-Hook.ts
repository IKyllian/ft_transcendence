import { useState, useRef, useContext, useEffect, useCallback } from "react";

import { Conversation, ConversationState, PreviousMessagesState, PrivateMessage, defaultMessagesState } from "../../Types/Chat-Types";
import { SocketContext } from "../../App";
import { useLocation, useParams } from "react-router-dom";
import { useAppSelector } from '../../Redux/Hooks'
import { getSecondUserIdOfPM } from "../../Utils/Utils-Chat";
import { UserInterface, UserStatus } from "../../Types/User-Types";
import { debounce } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";
import { fetchLoadPrevConvMessages } from "../../Api/Chat/Chat-Action";

export function usePrivateConvHook() {
    const [convDatas, setConvDatas] = useState<ConversationState | undefined>(undefined);
    const [userTyping, setUserTyping] = useState<UserInterface | undefined>(undefined);
    const [hasSendTypingEvent, setHasTypingEvent] = useState<boolean>(false);
    const [previousMessages, setPreviousMessages] = useState<PreviousMessagesState>(defaultMessagesState);
    const { register, handleSubmit, reset, formState: {errors} } = useForm<{inputMessage: string}>();
    const [haveToLoad, setHaveToLoad] = useState<boolean>(false);
    const [prevLength, setPrevLength] = useState<number>(0);

    const authDatas = useAppSelector((state) => state.auth);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const location = useLocation();
    const params = useParams();
    const convId: number | undefined = params.convId ? +params.convId! : undefined;
    const { socket } = useContext(SocketContext);

    const scrollToBottom = () => {
        // Permet de check si la div du chat est scrollable. Si elle ne l'est pas, load des datas pour que la div devienne scrollable
        var div = document.getElementsByClassName('chat-messages-wrapper');
        if (div.length > 0){
            var hasVerticalScrollbar = div[0].scrollHeight > div[0].clientHeight;
            if (!hasVerticalScrollbar && convId && convDatas) {
                fetchLoadPrevConvMessages(convId, setConvDatas, convDatas.conv.messages, setPreviousMessages);
            }
        } 
        messagesEndRef.current?.scrollIntoView();
    }

    const handleInputChange = () => {
        if (!hasSendTypingEvent) {
            socket?.emit("OnTypingPrivate", {
                userId: getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id),
                isTyping: true,
                convId: convId,
            })
            setHasTypingEvent(true);
        }
    }

    const endOfTyping = () => {
        socket?.emit("OnTypingPrivate", {
            userId: getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id),
            isTyping: false,
            convId: convId,
        })
        setHasTypingEvent(false);
    }

    const optimizedFn = useCallback(debounce(endOfTyping, 6000), [hasSendTypingEvent, convDatas, authDatas]);

    const handleOnScroll = (e: any) => {
        if (convId && convDatas && e && e.target && e.target.scrollTop < 5 && !previousMessages.reachedMax && !previousMessages.loadPreviousMessages && !haveToLoad) {
            setHaveToLoad(true);            
        }
    }

    useEffect(() => {
        if (haveToLoad && convId && convDatas && !previousMessages.loadPreviousMessages && !previousMessages.reachedMax) {
            setPreviousMessages(prev => { return {...prev, loadPreviousMessages: true}});
            fetchLoadPrevConvMessages(convId, setConvDatas, convDatas.conv.messages, setPreviousMessages);
        }
    }, [haveToLoad])

    const handleSubmitMessage = handleSubmit((data, e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            const secondUserId: number = getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id);
            if (convDatas?.temporary) {
                socket?.emit("CreateConversation", {
                    content: data.inputMessage,
                    adresseeId: secondUserId,
                });
            } else {
                socket?.emit("PrivateMessage", {
                    content: data.inputMessage,
                    adresseeId: secondUserId,
                });
            }
            socket?.emit("OnTypingPrivate", {
                userId: secondUserId,
                isTyping: false,
                convId: convId,
            })
            setHasTypingEvent(false);
        }
        if (data.inputMessage.length > 0) {
            submitMessage();
            reset();
        }
    })

    useEffect(() => {
        if (!previousMessages.loadPreviousMessages && convDatas) {
            scrollToBottom();
            setPrevLength(convDatas.conv.messages.length);
        } else if (convDatas) {
            const scrollToMessage = document.getElementById("chat-message-wrapper")?.getElementsByTagName('li');
            if (scrollToMessage && scrollToMessage.length > 0)
                scrollToMessage[convDatas.conv.messages.length - prevLength].scrollIntoView();
            setPrevLength(convDatas.conv.messages.length);
            setPreviousMessages((prev: PreviousMessagesState) => { return {...prev, loadPreviousMessages: false}});
            setHaveToLoad(false);
        }
    }, [convDatas?.conv.messages]);

    useEffect(() => {
        if (convId) {
            setConvDatas(undefined);
            setUserTyping(undefined);
            setPreviousMessages(defaultMessagesState);
            setHaveToLoad(false);
            setPrevLength(0);
            
            const listener = (data: PrivateMessage) => {
                console.log("NewPrivateMessage", data);
                setConvDatas((prev: any) => {
                    return {...prev, conv: {...prev.conv, messages: [...prev!.conv.messages, {...data}]}}
                });
            }
            
            socket?.on('NewPrivateMessage', listener);

            socket?.on("StatusUpdate", (data: {id: number, status: UserStatus}) => {
                setConvDatas(prev => { return prev ? {
                    ...prev, 
                    conv: {
                        ...prev.conv,
                        user1: prev.conv.user1.id === data.id ? {...prev.conv.user1, status: data.status} : {...prev.conv.user1},
                        user2: prev.conv.user2.id === data.id ? {...prev.conv.user2, status: data.status} : {...prev.conv.user2},
                    }
                } : undefined
                });
            });

            socket?.on("OnTypingPrivate", (data: {user: UserInterface, isTyping: boolean, convId: number}) => {
                if (data.convId === convId) {
                    if (data.isTyping)
                        setUserTyping(data.user);
                    else
                        setUserTyping(undefined);
                }
            });

            socket?.on("ConversationData", (data: Conversation) => {
                setConvDatas({temporary: false, conv: data});
            });

            if (location && location.state) {
                const locationState = location.state as {isTemp: boolean, conv: Conversation};
                setConvDatas({temporary: true, conv: {...locationState.conv}});
            } else {
                socket?.emit('JoinConversationRoom', {
                    id: convId,
                });
            }
        }

        return () => {
            if (convId) {
                socket?.emit("LeaveConversationRoom", {
                    id: convId,
                });
            }
            socket?.off("OnTypingPrivate");
            socket?.off("StatusUpdate")
            socket?.off("ConversationData");
            socket?.off("NewPrivateMessage");
        }
    }, [convId])

    return {
        convDatas,
        handleSubmit: handleSubmitMessage,
        messagesEndRef,
        loggedUser: authDatas.currentUser,
        optimizedFn,
        handleInputChange,
        userTyping,
        register,
        handleOnScroll,
        previousMessages,
    };
}