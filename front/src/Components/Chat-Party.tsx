import { IconSend } from "@tabler/icons";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "../Redux/Hooks";
import { changeSidebarChatStatus, closeSidebarChatStatus } from "../Redux/PartySlice";
import { Conversation, PrivateMessage } from "../Types/Chat-Types";
import { UserInterface, UserStatus } from "../Types/User-Types";
import ChatHeader from "./Chat/Chat-Section/Chat-Header";
import MessageItem from "./Chat/Chat-Section/Message-Item";

export const user1: UserInterface = {
    id: 0,
    username: "Kyllian",
    avatar: "",
    status: UserStatus.ONLINE,
    statistic: {
        match_won: 2,
        match_lost: 2,
    },
    channelUser: [],
    blocked: [],
    singles_elo: 1000,
	doubles_elo: 10000,
}
const user2: UserInterface = {
    id: 1,
    username: "Jojo",
    avatar: "",
    status: UserStatus.ONLINE,
    statistic: {
        match_won: 2,
        match_lost: 2,
    },
    channelUser: [],
    blocked: [],
    singles_elo: 1000,
	doubles_elo: 10000,
}

let MessagesExample: PrivateMessage[] = [];

const ConversationExample: Conversation = {
    id: 0,
    user1: user1,
    user2: user2,
    messages: MessagesExample,
}

MessagesExample = [
    {
        id: 0,
        sender: user1,
        content: "Hello",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    },
    {
        id: 1,
        sender: user1,
        content: "Hello2",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 2,
        sender: user2,
        content: "Hello",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 3,
        sender: user2,
        content: "Test",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 4,
        sender: user2,
        content: "test2",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }, {
        id: 5,
        sender: user1,
        content: "azeazeaze",
        send_at: "Thu Nov 17 2022 16:21:05 GMT+0100",
        conversation: ConversationExample,
    }
]
   

function ChatParty() {
    const dispatch = useAppDispatch();

    return (
        <div className="chat-party-sidebar">
            {/* <div className="chat-party-sidebar-wrapper"> */}
            <div className="message-container">
                <div className="message-container-main">
                <ChatHeader isPartyChat={true} />
                    <ul id="chat-message-wrapper" className="chat-messages-wrapper" >
                        {/* {
                            previousMessages.loadPreviousMessages && 
                            <li className="loader-wrapper">
                                <span className="prev-messages-loader"></span>
                            </li>
                        } */}
                        {
                            MessagesExample.map((elem, index) => {
                                const dateMessage = new Date(elem.send_at);
                                if (index === 0 || !elem.sender || MessagesExample[index - 1].sender?.id !== elem.sender?.id || (dateMessage.getDate() !== (new Date(MessagesExample[index - 1].send_at).getDate())))
                                    return <MessageItem key={index} isFromChan={false} message={elem} loggedUserIsOwner={true} isNewSender={true} index={index} />
                                else
                                    return <MessageItem key={index} isFromChan={false} message={elem} loggedUserIsOwner={true} isNewSender={false} index={index} />
                            }
                            )
                        }
                        {/* <div ref={messagesEndRef} /> */}
                    </ul>
                    <div className="message-input-container">
                            <form>
                                <input type="text" placeholder="Type Your Message..." />
                                <button type="submit"> <IconSend /> </button>
                            </form>
                            
                        </div>
                </div>
            </div>
        </div>
    );
}

export default ChatParty;