import { useState, useRef, useContext, useEffect } from "react";

import { Conversation } from "../../../Types/Chat-Types";
import LoadingSpin from "../../Utils/Loading-Spin";
import { SocketContext } from "../../../App";
import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import { useLocation, useParams } from "react-router-dom";
import { UserInterface } from "../../../Types/User-Types";

function PrivateMessageElement(props: {}) {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [convDatas, setConvDatas] = useState<Conversation | undefined>(undefined);
    const { } = props;
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const location = useLocation();
    const params = useParams();

    const { socket } = useContext(SocketContext);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        // if (params.convId) {
        //     // Load la conv
        // } else {

        // }

    }, [])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const submitMessage = () => {
            // socket!.emit("ChannelMessage", {
            //     content: inputMessage,
            //     chanId: parseInt(params.channelId!),
            // });
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
                    {/* <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} /> */}
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