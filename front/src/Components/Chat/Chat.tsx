import { useState } from "react";

import Header from "../Header/Header";
import Sidebar from "./Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet, useParams } from "react-router-dom";

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    return (
        <>
            <ChatModal setShowModal={setShowModal} showModal={showModal} />
            <Header />
            <div className="chat-page-container">
                <Sidebar setShowModal={setShowModal} showModal={showModal} />
                {
                    useParams().chatId === undefined
                    ? 
                    <div className="no-target-message">
                        <p> Sélectionnez un message ou un channel </p>
                    </div> 
                    :
                    <Outlet />
                }
            </div>
        </>
    );
}

export default Chat;