import { useContext } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2 } from "@tabler/icons";

import { SidebarContext } from "./Chat";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples";

function ChatHeader(props: {chatItem: ChannelInterface | PrivateMessageInterface | undefined}) {
    const { chatItem } = props;

    const sidebarStatus = useContext(SidebarContext);

    return ("channelName" in chatItem!) ? (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem.channelName} </p>
            <Link to={`/chat/${chatItem.id}/settings`}>
                <IconSettings />
            </Link>
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