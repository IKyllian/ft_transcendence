import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { IconSend } from "@tabler/icons";

import { Channel } from "../../../Types/Chat-Types";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import { useAppSelector } from '../../../Redux/Hooks'
import LoadingSpin from "../../Utils/Loading-Spin";
import { SocketContext } from "../../../App";

function ChatElement() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);

    let authDatas = useAppSelector((state) => state.auth);

    const {socket} = useContext(SocketContext);

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
        const getDatas = () => {
            socket!.emit("JoinChannelRoom", {
                id: parseInt(params.chatId!),
            });

            socket!.on('exception', (data: any) => {
                console.log(data);
            });

            socket!.on('roomData', (data: Channel) => {
                setChatDatas(data);
                if (data.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                    setLoggedUserIsOwner(true);
            });
        }
        if (params) {
            getDatas();
        }

        return () => {
            socket!.emit("LeaveChannelRoom", {
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
        socket!.on('NewChannelMessage', listener);
    }, [])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            socket!.emit("ChannelMessage", {
                content: inputMessage,
                chanId: parseInt(params.chatId!),
            });
            setInputMessage('');
        }
        if (inputMessage.length > 0) {
            submitMessage();
        }
    } 

    return (chatDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <div className="message-wrapper">
                    <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                    {/* <div className="ul-container"> */}
                        <ul>
                            {
                                chatDatas!.messages.map((elem, index) =>
                                    <MessageItem key={index} sender={elem.sender} message={elem.content} loggedUserIsOwner={loggedUserIsOwner} />
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