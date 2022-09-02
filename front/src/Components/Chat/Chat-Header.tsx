import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples";
import { IconSettings } from "@tabler/icons";
import { Link } from "react-router-dom";

function ChatHeader(props: {chatItem: ChannelInterface | PrivateMessageInterface | undefined}) {
    const { chatItem } = props;

    if ("channelName" in chatItem!) {
        return(
            <div className="message-header">
                <p className="chan-name"> # {chatItem.channelName} </p>
                <Link to={`/chat/${chatItem.id}/settings`}>
                    <IconSettings />
                </Link>
            </div>
        );
    } else {
        return(
            <div className="header-user-info">
                <div className={`player-status player-status-${chatItem!.user.isOnline ? "online" : "offline"}`}> </div>
                <p> {chatItem!.user.name} </p>
            </div>
        );
    }
}

export default ChatHeader;