import { IconSend, IconSettings } from "@tabler/icons";
import MessageItem from "./Message-Item";
import { ChannelInterface, PrivateMessageInterface } from "../../Interfaces/Datas-Examples";

function ChatElement(props: {chatItem: ChannelInterface | PrivateMessageInterface | undefined}) {
    const { chatItem } = props;

    if (chatItem === undefined) {
        return (
            <div className="no-target-message">
                <p> Sélectionnez un message ou un channel </p>
            </div>
        );
    } else {
        return (
            <div className="message-container">
                <div className="message-wrapper">
                    <div className="message-header">
                        {
                            "channelName" in chatItem
                            ? <p className="chan-name"> # {chatItem.channelName} </p>
                            : 
                            <div className="message-header-user-info">
                                <div className="player-status player-status-online"> </div>  <p> {chatItem.user.name} </p>
                            </div>
                        }
                        <IconSettings />
                    </div>
                    <div className="ul-container">
                        <ul>
                            {
                                chatItem.messages.map((elem, index) =>
                                    <MessageItem key={index} sender={elem.sender} message={elem.message} />
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div className="message-input-container">
                    <input type="text" placeholder="Type Your Message..." />
                    <IconSend />
                </div>
            </div>
        );
    }
    
}

export default ChatElement;