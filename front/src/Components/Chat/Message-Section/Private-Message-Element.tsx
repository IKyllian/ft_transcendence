import { useState, useRef, useContext, useEffect } from "react";

import { Conversation } from "../../../Types/Chat-Types";
import LoadingSpin from "../../Utils/Loading-Spin";
import { SocketContext } from "../../../App";
import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import { useLocation, useParams } from "react-router-dom";
import { UserInterface } from "../../../Types/User-Types";
import axios from "axios";
import { baseUrl } from "../../../env";
import { useAppSelector } from '../../../Redux/Hooks'
import { getSecondUserIdOfPM, getSecondUsernameOfPM } from "../../../Utils/Utils-Chat";
import ChatHeader from "./Chat-Header";

function PrivateMessageElement(props: {}) {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [convDatas, setConvDatas] = useState<Conversation | undefined>(undefined);

    let authDatas = useAppSelector((state) => state.auth);
    const { } = props;
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const location = useLocation();
    const params = useParams();

    const { socket } = useContext(SocketContext);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        console.log("PARAMS",parseInt(params.convId!));
        axios.get(`${baseUrl}/conversation/${parseInt(params.convId!)}`, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then(response => {
            console.log(response);
            setConvDatas(response.data);
        })
        .catch(err => {
            console.log(err);
        })
    }, [params])

    useEffect(() => {
        const listener = (data: any) => {
            setConvDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, data]}
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

    return (convDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <div className="message-wrapper">
                    <ChatHeader privateConvUser={getSecondUsernameOfPM(convDatas, authDatas.currentUser!.id)} />
                    <ul>
                        {
                            convDatas.messages.map((elem, index) =>
                                <MessageItem key={index} sender={elem.sender} message={elem.content} loggedUserIsOwner={true} />
                            )
                        }
                        <div ref={messagesEndRef} /> 
                    </ul>
                </div>
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PrivateMessageElement;