import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { IconSend } from "@tabler/icons";

import { ChatInterface, ChannelsDatas} from "../../../Types/Datas-Examples";
import { Channel } from "../../../Types/Chat-Types";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import axios from "axios";
import { baseUrl } from "../../../env";
import { useAppSelector } from '../../../Redux/Hooks'


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
        console.log(params);
        if (params) {
            axios.get(`${baseUrl}/channel/${params.chatId}`, {
                headers: {
                    "Authorization": `Bearer ${authDatas.token}`,
                }
            })
            .then((response) => {
                console.log(response); 
                setChatDatas(response.data);
            }).catch(err => {
                console.log(err);
            })
        }
    }, [params])

    useEffect(() => {
        authDatas.socket.on('message', (data: any) => {
            console.log("On socket", data);
        });
    }, [authDatas.socket])

    //Quand l'url change emit un event onLeaveRoom avec l'id de la room

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (inputMessage.length > 0) {
            axios.post(`${baseUrl}/channel/${params.chatId}/messages`, {content: inputMessage}, {
                headers: {
                    "Authorization": `Bearer ${authDatas.token}`,
                }
            })
            .then((response) => {
                console.log(response);
                let newArray = chatDatas;
                chatDatas?.messages.push(response.data);
                setChatDatas(newArray);
            })
            .catch((err) => {
                console.log(err);
            })
        }
    } 

    return (chatDatas === undefined) ? (
        <div className="no-target-message">
            <p> Sélectionnez un message ou un channel </p>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <div className="message-wrapper">
                    <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                    <div className="ul-container">
                        <ul>
                            {
                                chatDatas!.messages.map((elem, index) =>
                                    <MessageItem key={index} sender={elem.sender} message={elem.content} />
                                )
                            }
                        </ul>
                        {/* <div ref={messagesEndRef} /> */}
                    </div>
                </div>
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        {/* <button> <IconSend /> </button> */}
                    </form>
                    <IconSend />
                </div>
            </div>
            <UsersSidebar usersList={chatDatas.channelUsers} />
            {/* { showUsersSidebar && chatDatas.isChannel && <UsersSidebar usersList={chatDatas.users} /> } */}
        </div>
    );
}

export default ChatElement;