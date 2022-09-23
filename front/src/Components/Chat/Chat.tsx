import { useState, useContext, createContext, useEffect } from "react";

import Sidebar from "./Sidebar/Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet, useParams } from "react-router-dom";
import { ModalContext } from "../Utils/ModalProvider";

export const SidebarContext = createContext({sidebar: false, setSidebarStatus: () => {}});

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(false);
    // const [channelsDatas, setChannelsDatas] = useState<ChannelInterface | undefined>(undefined);

    const params = useParams();
    const modalStatus = useContext(ModalContext);

    const handleClick = () => {
        setReponsiveSidebar(!responsiveSidebar);
    }

    useEffect(() => {
        if (params.chatId === undefined) {
            setReponsiveSidebar(true);
        }
    }, [params])

    // useEffect(() => {
        // Fetch to get channels
    // }, [])

    // return !channelsDatas ? (

    // ) : (

    // )
    return (
        <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: handleClick}}>
            <ChatModal showModal={showModal} setShowModal={setShowModal}  />
            <div className={`chat-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
                <Sidebar setShowModal={setShowModal} showModal={showModal} />
                {
                    params.chatId === undefined
                    ? 
                    <div className="no-target-message">
                        <p> Sélectionnez un message ou un channel </p>
                    </div> 
                    :
                    <Outlet />
                }
            </div>
        </SidebarContext.Provider>
    );
}

export default Chat;