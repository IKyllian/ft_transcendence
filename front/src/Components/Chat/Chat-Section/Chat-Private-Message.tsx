import LoadingSpin from "../../Utils/Loading-Spin";
import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import { getSecondUserOfPM } from "../../../Utils/Utils-Chat";
import ChatHeader from "./Chat-Header";
import { usePrivateConvHook } from "../../../Hooks/Chat/Private-Conv-Hook";

function ChatPrivateMessage() {
    const {
        convDatas,
        handleSubmit,
        messagesEndRef,
        loggedUser,
        optimizedFn,
        handleInputChange,
        userTyping,
        register,
        handleOnScroll,
        previousMessages,
    } = usePrivateConvHook();

    return (convDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <ChatHeader privateConvUser={getSecondUserOfPM(convDatas.conv, loggedUser!.id)} />
                <ul id="chat-message-wrapper" className="chat-messages-wrapper" onScroll={(e) => handleOnScroll(e)}>
                    {
                        previousMessages.loadPreviousMessages && 
                        <li className="loader-wrapper">
                            <span className="prev-messages-loader"></span>
                        </li>
                    }
                    {
                        convDatas.conv.messages.map((elem, index) => {
                            const dateMessage = new Date(elem.send_at);
                            if (index === 0 || !elem.sender || convDatas.conv.messages[index - 1].sender?.id !== elem.sender?.id || (dateMessage.getDate() !== (new Date(convDatas.conv.messages[index - 1].send_at).getDate())))
                                return <MessageItem key={index} isFromChan={false} message={elem} loggedUserIsOwner={true} isNewSender={true} index={index} />
                            else
                                return <MessageItem key={index} isFromChan={false} message={elem} loggedUserIsOwner={true} isNewSender={false} index={index} />
                        }
                            
                        )
                    }
                    <div ref={messagesEndRef} /> 
                </ul>
                
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        { userTyping && <p> {userTyping.username} is typing... </p> }
                        <input type="text" placeholder="Type Your Message..." {...register('inputMessage', {minLength: 1, onChange: (e) => {optimizedFn(e.target.value); handleInputChange()}})} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatPrivateMessage;