import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import LoadingSpin from "../../Utils/Loading-Spin";
import { useChannelHook } from "../../../Hooks/Chat/Channel-Hook";
import { UserInterface } from "../../../Types/User-Types";

function ChatChannel() {
    const {
        loggedUserIsOwner,
        changeSidebarStatus,
        handleSubmit,
        messagesEndRef,
        showUsersSidebar,
        chatDatas,
        optimizedFn,
        handleInputChange,
        usersTyping,
        register,
        handleOnScroll,
        previousMessages,
    } = useChannelHook();

    return (chatDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <ChatHeader chatItem={chatDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                <ul id="chat-message-wrapper" className="chat-messages-wrapper" onScroll={(e) => handleOnScroll(e)}>
                    {
                        previousMessages.loadPreviousMessages && 
                        <li className="loader-wrapper">
                            <span className="prev-messages-loader"></span>
                        </li>
                    }
                    {
                        chatDatas.messages.map((elem, index) => {
                            if (index === 0 || !elem.sender || chatDatas.messages[index - 1].sender?.id !== elem.sender?.id || (elem.send_at.getDate() !== chatDatas.messages[index - 1].send_at.getDate()))
                                return <MessageItem key={index} isFromChan={true} message={elem} loggedUserIsOwner={loggedUserIsOwner} chan={chatDatas} isNewSender={true} index={index} />
                            else
                                return <MessageItem key={index} isFromChan={true} message={elem} loggedUserIsOwner={loggedUserIsOwner} chan={chatDatas} isNewSender={false} index={index} />
                        }
                        )
                    }
                    <div ref={messagesEndRef} />
                </ul>
                {
                    usersTyping.length > 0 &&
                    usersTyping.length < 4 && 
                    <p> {usersTyping.map((user: UserInterface) => {
                        return `${user.username} `
                    })} is typing...</p>
                }
                {
                    usersTyping.length > 3 &&
                    <p> Many users are typing... </p>
                }
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." {...register('inputMessage', {minLength: 1, onChange: (e) => {optimizedFn(e.target.value); handleInputChange()}})} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                    
                </div>
            </div>
            { showUsersSidebar && <UsersSidebar usersList={chatDatas.channelUsers} usersTimeout={chatDatas.usersTimeout} loggedUserIsOwner={loggedUserIsOwner} /> }
        </div>
    );
}

export default ChatChannel;