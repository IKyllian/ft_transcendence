import { useContext } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2, IconChevronLeft, IconChevronRight } from "@tabler/icons";

import { SidebarContext } from "../Chat";
import { ChatInterface } from "../../../Types/Datas-Examples";
import { Channel } from "../../../Types/Chat-Types"

interface Props {
    chatItem?: Channel | undefined,
    privateConvUser?: string,
    showUsersSidebar?: boolean,
    changeSidebarStatus?: Function,
}

function ChatHeader(props: Props) {
    const { chatItem, privateConvUser, showUsersSidebar, changeSidebarStatus } = props;

    const sidebarStatus = useContext(SidebarContext);

    return (chatItem && changeSidebarStatus) ? (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem?.name} </p>
            <div className="message-header-right-side">
                <Link to={`/chat/channel/${chatItem?.id}/settings`} state={chatItem} >
                    <IconSettings />
                </Link>
                {showUsersSidebar === false && <IconChevronLeft onClick={() => changeSidebarStatus()} />}
                {showUsersSidebar && <IconChevronRight onClick={() => changeSidebarStatus()} />}
            </div>
        </div>
    ) : (
        <div className="header-user-info">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <div className="player-container">
                <div className={`player-status player-status-online`}> </div>
                <p> {privateConvUser} </p>
            </div>
        </div>
    );
}

export default ChatHeader;