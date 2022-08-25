import { useState } from "react";

import Header from "../Header/Header";
import Sidebar from "./Sidebar";
import AddChannelModal from "./Add-Channel-Modal";
import ChatElement from "./Chat-Element";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples";


function Chat() {
    const [showChannelModal, setShowChannelModal] = useState<boolean>(false);
    const [chatItem, setChatItem] = useState<ChannelInterface | PrivateMessageInterface | undefined>(undefined);
    return (
        <>
            <AddChannelModal setShowModal={setShowChannelModal} show={showChannelModal} />
            <Header />
            <div className="chat-page-container">
                <Sidebar setShowChannelModal={setShowChannelModal} showModal={showChannelModal} setChatItem={setChatItem} />
                <ChatElement chatItem={chatItem} />
            </div>
        </>
    );
}


export default Chat;