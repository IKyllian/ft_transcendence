import { useState, useRef, useContext, useEffect } from "react";

import { Conversation, ChatMessage } from "../../Types/Chat-Types";
import { SocketContext } from "../../App";
import { useParams } from "react-router-dom";
import { useAppSelector } from '../../Redux/Hooks'
import { getSecondUserIdOfPM } from "../../Utils/Utils-Chat";
import { fetchPrivateConvDatas } from "../../Api/Chat/Chat-Fetch";

export function usePrivateConvHook() {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [convDatas, setConvDatas] = useState<Conversation | undefined>(undefined);

    let authDatas = useAppSelector((state) => state.auth);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const params = useParams();
    const convId: number | undefined = params.convId ? parseInt(params.convId!) : undefined;
    const { socket } = useContext(SocketContext);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            socket!.emit("PrivateMessage", {
                content: inputMessage,
                adresseeId: getSecondUserIdOfPM(convDatas!, authDatas.currentUser!.id),
            });
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
            fetchPrivateConvDatas(convId, authDatas.token, setConvDatas);
        }
        
    }, [convId])

    useEffect(() => {
        const listener = (data: ChatMessage) => {
            setConvDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, {...data, send_at: new Date(data.send_at)}]}
            });
        }

        socket!.on('NewPrivateMessage', listener);
        socket!.on('exception', (data: any) => {
            console.log("Exeption", data);
        });

        return () => {
            socket!.off("NewPrivateMessage");
            socket!.off("exception");
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