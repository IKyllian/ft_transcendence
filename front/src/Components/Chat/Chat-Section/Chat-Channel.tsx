import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import LoadingSpin from "../../Utils/Loading-Spin";
import { useChannelHook } from "../../../Hooks/Chat/Channel-Hook";

function ChatChannel() {
    const {
        loggedUserIsOwner,
        changeSidebarStatus,
        handleSubmit,
        messagesEndRef,
        inputMessage,
        setInputMessage,
        showUsersSidebar,
        chatDatas,
    } = useChannelHook();

    return (chatDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                <ul>
                    {
                        chatDatas.messages.map((elem, index) =>
                            <MessageItem key={index} isFromChan={true} message={elem} loggedUserIsOwner={loggedUserIsOwner} chanId={chatDatas.id} />
                        )
                    }
                    <div ref={messagesEndRef} /> 
                </ul>
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                </div>
            </div>
            { showUsersSidebar && <UsersSidebar usersList={chatDatas.channelUsers} /> }
        </div>
    );
}

export default ChatChannel;