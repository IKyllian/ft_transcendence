import { useState, useRef, useContext, useEffect, useCallback } from "react";

import { Conversation, PrivateMessage } from "../../Types/Chat-Types";
import { SocketContext } from "../../App";
import { useLocation, useParams } from "react-router-dom";
import { useAppSelector } from '../../Redux/Hooks'
import { getSecondUserIdOfPM } from "../../Utils/Utils-Chat";
import { fetchPrivateConvDatas } from "../../Api/Chat/Chat-Fetch";
import { UserInterface } from "../../Types/User-Types";
import { debounce } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";

interface ConversationState {
    temporary: boolean,
    conv: Conversation
}

export function usePrivateConvHook() {
    const [convDatas, setConvDatas] = useState<ConversationState | undefined>(undefined);
    const [userTyping, setUserTyping] = useState<UserInterface | undefined>(undefined);
    const [hasSendTypingEvent, setHasTypingEvent] = useState<boolean>(false);
    const { register, handleSubmit, reset, formState: {errors} } = useForm<{inputMessage: string}>();

    const authDatas = useAppSelector((state) => state.auth);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const location = useLocation();
    const params = useParams();
    const convId: number | undefined = params.convId ? parseInt(params.convId!) : undefined;
    const { socket } = useContext(SocketContext);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        console.log("OnTypingPrivate", getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id));
        console.log("convId", convId);
        socket?.emit("OnTypingPrivate", {
            userId: getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id),
            isTyping: false,
            convId: convId,
        })
        setHasTypingEvent(false);
    }

    const optimizedFn = useCallback(debounce(endOfTyping, 6000), [hasSendTypingEvent, convDatas, authDatas]);

    const handleSubmitMessage = handleSubmit((data, e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            const secondUserId: number = getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id);
            console.log();
            if (convDatas?.temporary) {
                socket!.emit("CreateConversation", {
                    content: data.inputMessage,
                    adresseeId: secondUserId,
                });
            } else {
                socket!.emit("PrivateMessage", {
                    content: data.inputMessage,
                    adresseeId: secondUserId,
                });
            }
            socket?.emit("OnTypingPrivate", {
                userId: secondUserId,
                isTyping: false,
            })
            setHasTypingEvent(false);
        }
        if (data.inputMessage.length > 0) {
            submitMessage();
            reset();
        }
    })

    useEffect(() => {
        scrollToBottom();
    }, [convDatas])

    useEffect(() => {
        if (convId) {
            setConvDatas(undefined);
            setUserTyping(undefined);
            socket?.on("OnTypingPrivate", (data: {user: UserInterface, isTyping: boolean, convId: number}) => {
                console.log("data", data);
                console.log("convId", convId);
                if (data.convId === convId) {
                    if (data.isTyping)
                        setUserTyping(data.user);
                    else
                        setUserTyping(undefined);
                }
            });

            if (location && location.state) {
                const locationState = location.state as {isTemp: boolean, conv: Conversation};
                if (locationState.isTemp)
                    setConvDatas({temporary: true, conv: {...locationState.conv}});
                else
                    setConvDatas({temporary: true, conv: {...locationState.conv}});
            } else {
                fetchPrivateConvDatas(convId, authDatas.token, setConvDatas);
            }
        }

        return () => {
            socket?.off("OnTypingPrivate");
        }
    }, [convId])

    useEffect(() => {
        const listener = (data: PrivateMessage) => {
            console.log("NewPrivateMessage", data);
            setConvDatas((prev: any) => {
                return {...prev, conv: {...prev.conv, messages: [...prev!.conv.messages, {...data, send_at: new Date(data.send_at)}]}}
            });
        }
        socket!.on('NewPrivateMessage', listener);
        return () => {
            socket!.off("NewPrivateMessage");
        }
    }, [])

    return {
        convDatas: convDatas,
        handleSubmit: handleSubmitMessage,
        messagesEndRef: messagesEndRef,
        loggedUser: authDatas.currentUser,
        optimizedFn: optimizedFn,
        handleInputChange: handleInputChange,
        userTyping: userTyping,
        register: register,
    };
}