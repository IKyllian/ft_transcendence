import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { IconSend } from "@tabler/icons";

import { ChatInterface, ChannelsDatas} from "../../../Types/Datas-Examples";
import { Channel } from "../../../Types/Chat-Types";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import axios from "axios";
import { baseUrl, socketUrl } from "../../../env";
import { useAppSelector } from '../../../Redux/Hooks'
import LoadingSpin from "../../Utils/Loading-Spin";
import { ChatMessage } from "../../../Types/Chat-Types";


function ChatElement() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');

    let authDatas = useAppSelector((state) => state.auth);

    const changeSidebarStatus = () => {
        setShowUsersSidebar(!showUsersSidebar);
    }
    // const messagesEndRef = useRef<null | HTMLDivElement>(null);
    let params = useParams();

    // const scrollToBottom = () => {
    //     console.log(messagesEndRef);
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }
    // useEffect(() => {
    //     scrollToBottom()
    // }, [params]);

    useEffect(() => {
        const getDatas = async () => {
            authDatas.socket.emit("JoinChannelRoom", {
                id: parseInt(params.chatId!),
            });

            await authDatas.socket.on('exception', (data: any) => {
                console.log(data);
            });

            await authDatas.socket.on('roomData', (data: any) => {
                console.log(data);
                setChatDatas(data);
            });
        }
        if (params) {
            getDatas();
            // axios.get(`${baseUrl}/channel/${params.chatId}`, {
            //     headers: {
            //         "Authorization": `Bearer ${authDatas.token}`,
            //     }
            // })
            // .then(async (response) => {
            //     console.log(response);
            //     await authDatas.socket.emit("JoinChannelRoom", {
            //         chanId: params.chatId,
            //     });
            //     setChatDatas(response.data);
            // }).catch(err => {
            //     console.log(err);
            // })
        }

        return () => {
            return authDatas.socket.emit("LeaveChannelRoom", {
                id: parseInt(params.chatId!),
            });
        }
    }, [params])

    useEffect(() => {
        const listener = (data: any) => {
            setChatDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, data]}
            });
        }
        authDatas.socket.on('NewChannelMessage', listener);
    }, [])

    //Quand l'url change emit un event onLeaveRoom avec l'id de la room

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = async () => {
            await authDatas.socket.emit("ChannelMessage", {
                content: inputMessage,
                chanId: parseInt(params.chatId!),
            });
            setInputMessage('');
        }
        if (inputMessage.length > 0) {
            submitMessage();
            // axios.post(`${baseUrl}/channel/${params.chatId}/messages`, {content: inputMessage}, {
            //     headers: {
            //         "Authorization": `Bearer ${authDatas.token}`,
            //     }
            // })
            // .then(async (response) => {
            //     console.log(response);
            //     await authDatas.socket.emit("ChannelMessage", {
            //         msg: response.data,
            //     });
            //     setChatDatas((prev: any) => {
            //         return {...prev, messages: [...prev!.messages, response.data]}
            //     });
            //     setInputMessage('');
            // })
            // .catch((err) => {
            //     console.log(err);
            // })
        }
    } 

    return (chatDatas === undefined) ? (
        <LoadingSpin classContainer="chat-page-container" />
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <div className="message-wrapper">
                    <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                    {/* <div className="ul-container"> */}
                        <ul>
                            {
                                chatDatas!.messages.map((elem, index) =>
                                    <MessageItem key={index} sender={elem.sender} message={elem.content} />
                                )
                            }
                        </ul>
                        {/* <div ref={messagesEndRef} /> */}
                    {/* </div> */}
                </div>
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        {/* <button> <IconSend /> </button> */}
                    </form>
                    <IconSend />
                </div>
            </div>
            { showUsersSidebar && <UsersSidebar usersList={chatDatas.channelUsers} /> }
        </div>
    );
}

export default ChatElement;