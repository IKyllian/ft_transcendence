import { useContext } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2, IconChevronLeft, IconChevronRight } from "@tabler/icons";

import { SidebarContext } from "../Chat";
import { ChannelInterface, PrivateMessageInterface } from "../../../Interfaces/Datas-Examples";

interface Props {
    chatItem: ChannelInterface | PrivateMessageInterface | undefined,
    showUsersSidebar: boolean,
    changeSidebarStatus: Function,
}

function ChatHeader(props: Props) {
    const { chatItem, showUsersSidebar, changeSidebarStatus } = props;

    const sidebarStatus = useContext(SidebarContext);

    return ("channelName" in chatItem!) ? (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem.channelName} </p>
            <div className="message-header-right-side">
                <Link to={`/chat/${chatItem.id}/settings`}>
                    <IconSettings />
                </Link>
                {!showUsersSidebar && <IconChevronLeft onClick={() => changeSidebarStatus()} />}
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
                <div className={`player-status player-status-${chatItem!.user.isOnline ? "online" : "offline"}`}> </div>
                <p> {chatItem!.user.name} </p>
            </div>
            
        </div>
    );
}

export default ChatHeader;