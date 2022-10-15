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

function ChatChannel() {
    const [chatDatas, setChatDatas] = useState<Channel | undefined>(undefined);
    const [showUsersSidebar, setShowUsersSidebar] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    let authDatas = useAppSelector((state) => state.auth);
    const params = useParams();
    const {socket} = useContext(SocketContext);

    // console.log("chatDatas state", chatDatas);
    const changeSidebarStatus = () => {
        setShowUsersSidebar(!showUsersSidebar);
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [chatDatas?.messages]);

    useEffect(() => {
        setChatDatas(undefined);
        const getDatas = () => {
            socket!.emit("JoinChannelRoom", {
                id: parseInt(params.channelId!),
            });

            socket!.on('exception', (data: any) => {
                console.log(data);
            });

            socket!.on('roomData', (data: Channel) => {
                let channel: Channel = data;
                channel.messages.forEach(elem => elem.send_at = new Date(elem.send_at));
                setChatDatas({...channel});
                if (data.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                    setLoggedUserIsOwner(true);
            });
        }
        if (params.channelId) {
            getDatas();
        }

        return () => {
            socket!.emit("LeaveChannelRoom", {
                id: parseInt(params.channelId!),
            });
            socket!.off("exception");
            socket!.off("roomData");
        }
    }, [params.channelId])

    useEffect(() => {
        const listener = (data: any) => {
            setChatDatas((prev: any) => {
                return {...prev, messages: [...prev!.messages, data]}
            });
        }
        socket!.on('NewChannelMessage', listener);

        return () => {
            socket!.off("NewChannelMessage");
        }
    }, [])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            socket!.emit("ChannelMessage", {
                content: inputMessage,
                chanId: parseInt(params.channelId!),
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
                    <ul>
                        {
                            chatDatas!.messages.map((elem, index) =>
                                <MessageItem key={index} isFromChan={true} message={elem} loggedUserIsOwner={loggedUserIsOwner} />
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
            { showUsersSidebar && <UsersSidebar usersList={chatDatas.channelUsers} /> }
        </div>
    );
}

export default ChatChannel;