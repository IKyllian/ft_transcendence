import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IconSend } from "@tabler/icons";

import { ChannelInterface, PrivateMessageInterface, ChannelsDatas} from "../../Interfaces/Datas-Examples";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";

function ChatElement() {
    const [chatDatas, setChatDatas] = useState<ChannelInterface | PrivateMessageInterface | undefined>(undefined);
    let params = useParams();

    useEffect(() => {
        if (params) {
            setChatDatas(ChannelsDatas.find((elem) => elem.id === parseInt(params.chatId!, 10)));
        }
    }, [params])

    if (chatDatas === undefined) {
        return (
            <div className="no-target-message">
                <p> Sélectionnez un message ou un channel </p>
            </div>
        );
    } else {
        return (
            <div className="message-container">
                <div className="message-wrapper">
                   <ChatHeader chatItem={chatDatas} />
                    <div className="ul-container">
                        <ul>
                            {
                                chatDatas!.messages.map((elem, index) =>
                                    <MessageItem key={index} sender={elem.sender} message={elem.message} />
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div className="message-input-container">
                    <input type="text" placeholder="Type Your Message..." />
                    <IconSend />
                </div>
            </div>
        );
    }
    
}

export default ChatElement;