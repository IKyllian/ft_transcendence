import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import ChatHeader from "./Chat-Header";
import UsersSidebar from "./Users-Sidebar";
import LoadingSpin from "../../Utils/Loading-Spin";
import { useChannelHook } from "../../../Hooks/Chat/Channel-Hook";
import { UserInterface } from "../../../Types/User-Types";

function ChatChannel() {
    const {
        changeSidebarStatus,
        handleSubmit,
        messagesEndRef,
        showUsersSidebar,
        channelDatas,
        optimizedFn,
        handleInputChange,
        usersTyping,
        register,
        handleOnScroll,
        previousMessages,
    } = useChannelHook();

    if (channelDatas === undefined) {
        return (
            <div style={{width: "100%"}}>
                <LoadingSpin classContainer="chat-page-container"/>
            </div>
        );
    } else if (channelDatas === null) {
        return (
            <div className="no-target-message">
                <p> Channel Not Found </p>
            </div>
        );
    }

    return (
        <>
            <div className="message-container-main">
                <ChatHeader chatItem={channelDatas} showUsersSidebar={showUsersSidebar} changeSidebarStatus={changeSidebarStatus} />
                <ul id="chat-message-wrapper" className="chat-messages-wrapper" onScroll={(e) => handleOnScroll(e)}>
                    {
                        previousMessages.loadPreviousMessages && 
                        <li className="loader-wrapper">
                            <span className="prev-messages-loader"></span>
                        </li>
                    }
                    {
                        channelDatas.messages.map((elem, index) => {
                            const dateMessage = new Date(elem.send_at);
                            if (index === 0 || !elem.sender || channelDatas.messages[index - 1].sender?.id !== elem.sender?.id || (dateMessage.getDate() !== (new Date(channelDatas.messages[index - 1].send_at).getDate())))
                                return <MessageItem key={index} isFromChan={true} message={elem} isNewSender={true} index={index} />
                            else
                                return <MessageItem key={index} isFromChan={true} message={elem} isNewSender={false} index={index} />
                        }
                        )
                    }
                    <div ref={messagesEndRef} />
                </ul>               
                <div className="message-input-container">
                    <form style={usersTyping.length > 0 ? {marginTop: "25px"}: {}} onSubmit={handleSubmit}>
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
                        <input autoComplete="off" type="text" placeholder="Type Your Message..." {...register('inputMessage', {minLength: 1, onChange: (e) => {optimizedFn(e.target.value); handleInputChange()}})} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                    
                </div>
            </div>
            { showUsersSidebar && <UsersSidebar usersList={channelDatas.channelUsers} /> }
        </>            
    );
}

export default ChatChannel;