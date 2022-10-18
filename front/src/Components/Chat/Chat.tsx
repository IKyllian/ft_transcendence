import { useContext, createContext } from "react";

import Sidebar from "./Sidebar/Sidebar";
import ChatModal from "./Chat-Modal";
import { Outlet} from "react-router-dom";
import { ModalContext } from "../Utils/ModalProvider";
import LoadingSpin from "../Utils/Loading-Spin";
import { useLoadChatDatas } from "../../Hooks/Chat/Chat-Hooks";

export const SidebarContext = createContext({sidebar: false, setSidebarStatus: () => {}});

function Chat() {
    const {
        channels,
        privateConvs,
        showModal,
        responsiveSidebar,
        sidebarOnChange,
        onCloseModal,
        changeModalStatus,
        paramsChannelId,
        locationPathname,
    } =  useLoadChatDatas();

    console.log("Chat re Render");

    const modalStatus = useContext(ModalContext);

    return !channels || !privateConvs ? (
        <LoadingSpin classContainer="chat-page-container" />
    ) : (
        <SidebarContext.Provider value={{sidebar: responsiveSidebar, setSidebarStatus: sidebarOnChange}}>
            <ChatModal onCloseModal={onCloseModal} showModal={showModal}   />
            <div className={`chat-page-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
                <Sidebar setShowModal={changeModalStatus} chanDatas={channels} privateConvs={privateConvs} />
                {
                    paramsChannelId === undefined && locationPathname === "/chat"
                    ?
                    <div className="no-target-message">
                        <p> Sélectionnez un message ou un channel </p>
                    </div> 
                    :
                    <Outlet />
                }
            </div>
        </SidebarContext.Provider>
    )
}

export default Chat;