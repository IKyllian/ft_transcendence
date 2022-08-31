import { useState } from "react";

import Header from "../Header/Header";
import Sidebar from "./Sidebar";
import ChatModal from "./Chat-Modal";
import ChatElement from "./Chat-Element";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples";

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    const [chatItem, setChatItem] = useState<ChannelInterface | PrivateMessageInterface | undefined>(undefined);
    return (
        <>
            <ChatModal setShowModal={setShowModal} showModal={showModal} />
            <Header />
            <div className="chat-page-container">
                <Sidebar setShowModal={setShowModal} showModal={showModal} setChatItem={setChatItem} />
                <ChatElement chatItem={chatItem} />
            </div>
        </>
    );
}

export default Chat;