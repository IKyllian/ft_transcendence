import { useState, useContext, createContext, useEffect } from "react";

import Header from "../Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet, useParams } from "react-router-dom";
import { ModalContext } from "../ModalProvider";

export const SidebarContext = createContext({sidebar: false, setSidebarStatus: () => {}});

function Chat() {
    const [showModal, setShowModal] = useState<number>(0);
    const [responsiveSidebar, setReponsiveSidebar] = useState<boolean>(false);

    const params = useParams();

    const handleClick = () => {
        setReponsiveSidebar(!responsiveSidebar);
    }

    const modalStatus = useContext(ModalContext);

    useEffect(() => {
        if (params.chatId === undefined) {
            setReponsiveSidebar(true);
        }
    }, [params])

    return (
        <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: handleClick}}>
            <ChatModal showModal={showModal} setShowModal={setShowModal}  />
            <Header />
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