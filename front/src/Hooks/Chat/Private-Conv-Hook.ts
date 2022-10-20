import { useState, useRef, useContext, useEffect } from "react";

import { Conversation, ConversationInterfaceFront, PrivateMessage } from "../../Types/Chat-Types";
import { SocketContext } from "../../App";
import { useLocation, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks'
import { getSecondUserIdOfPM } from "../../Utils/Utils-Chat";
import { fetchPrivateConvDatas } from "../../Api/Chat/Chat-Fetch";

interface ConversationState {
    temporary: boolean,
    conv: Conversation
}

export function usePrivateConvHook() {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [convDatas, setConvDatas] = useState<ConversationState | undefined>(undefined);

    const authDatas = useAppSelector((state) => state.auth);
    const {privateConv} = useAppSelector((state) => state.chat);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const location = useLocation();
    const params = useParams();
    const convId: number | undefined = params.convId ? parseInt(params.convId!) : undefined;
    const { socket } = useContext(SocketContext);
    const dispatch = useAppDispatch();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            if (convDatas?.temporary) {
                socket!.emit("CreateConversation", {
                    content: inputMessage,
                    adresseeId: getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id),
                });
            } else {
                socket!.emit("PrivateMessage", {
                    content: inputMessage,
                    adresseeId: getSecondUserIdOfPM(convDatas?.conv!, authDatas.currentUser!.id),
                });
            }
            setInputMessage('');
        }
        if (inputMessage.length > 0) {
            submitMessage();
        }
    } 

    useEffect(() => {
        scrollToBottom();
    }, [convDatas])

    useEffect(() => {
        if (convId) {
            setConvDatas(undefined);
            if (location && location.state) {
                const locationState = location.state as {conv: ConversationInterfaceFront};
                setConvDatas({temporary: true, conv: {...locationState.conv.conversation, messages: []}});
            } else {
                fetchPrivateConvDatas(convId, authDatas.token, setConvDatas);
            }
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
        inputMessage: inputMessage,
        setInputMessage: setInputMessage,
        handleSubmit: handleSubmit,
        messagesEndRef: messagesEndRef,
        loggedUser: authDatas.currentUser,
    };
}