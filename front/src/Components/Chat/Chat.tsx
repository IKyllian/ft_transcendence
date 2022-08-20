import React from "react"
import {IconSend} from "@tabler/icons";

import Header from "../Header/Header";
import Sidebar from "./Sidebar";
import MessageItem from "./Message-Item";

function Chat() {
    return (
        <>
            <Header />
            <div className="chat-page-container">
                <Sidebar />
                <div className="message-container">
                    <div className="message-wrapper">
                        <div className="message-header">
                            <p> # Géneral </p>
                        </div>
                        <div className="ul-container">
                            <ul>
                                <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} />
                                <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} />
                                <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} />
                                {/* <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} />
                                <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} />
                                <MessageItem userIsSender={false} />
                                <MessageItem userIsSender={true} /> */}
                            </ul>
                        </div>
                    </div>
                    <div className="message-input-container">
                        <input type="text" placeholder="Type Your Message..." />
                        <IconSend />
                    </div>
                </div>
            </div>
        </>
    );
}


export default Chat;