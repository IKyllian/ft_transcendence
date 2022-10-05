import { useContext } from "react";
import { Link } from "react-router-dom";
import { IconSettings, IconMenu2, IconChevronLeft, IconChevronRight } from "@tabler/icons";

import { SidebarContext } from "../Chat";
import { ChatInterface } from "../../../Types/Datas-Examples";
import { Channel } from "../../../Types/Chat-Types"

interface Props {
    chatItem: Channel | undefined,
    showUsersSidebar: boolean,
    changeSidebarStatus: Function,
}

function ChatHeader(props: Props) {
    const { chatItem, showUsersSidebar, changeSidebarStatus } = props;

    const sidebarStatus = useContext(SidebarContext);

    // return (chatItem && chatItem.isChannel) ? (
    return (
        <div className="message-header">
            <IconMenu2
                className="burger-icon-responsive"
                onClick={() => sidebarStatus.setSidebarStatus()}
            />
            <p className="chan-name"> # {chatItem?.name} </p>
            <div className="message-header-right-side">
                <Link to={`/chat/${chatItem?.id}/settings`} state={chatItem} >
                    <IconSettings />
                </Link>
                {!showUsersSidebar && <IconChevronLeft onClick={() => changeSidebarStatus()} />}
                {showUsersSidebar && <IconChevronRight onClick={() => changeSidebarStatus()} />}
            </div>
        </div>
    )
    // : (
    //     <div className="header-user-info">
    //         <IconMenu2
    //             className="burger-icon-responsive"
    //             onClick={() => sidebarStatus.setSidebarStatus()}
    //         />
    //         <div className="player-container">
    //             <div className={`player-status player-status-${chatItem!.users[0].isOnline ? "online" : "offline"}`}> </div>
    //             <p> {chatItem!.users[0].username} </p>
    //         </div>
    //     </div>
    // );
}

export default ChatHeader;