import LoadingSpin from "../../Utils/Loading-Spin";
import { IconSend } from "@tabler/icons";
import MessageItem from "./Message-Item";
import { getSecondUserOfPM } from "../../../Utils/Utils-Chat";
import ChatHeader from "./Chat-Header";

import { usePrivateConvHook } from "../../../Hooks/Chat/Private-Conv-Hook";

function ChatPrivateMessage() {
    const {
        convDatas,
        inputMessage,
        setInputMessage,
        handleSubmit,
        messagesEndRef,
        loggedUser,
        optimizedFn,
        handleInputChange,
        userTyping,
    } = usePrivateConvHook();

    console.log("convDatas", convDatas);
    console.log("loggedUser", loggedUser);
    return (convDatas === undefined) ? (
        <div style={{width: "100%"}}>
            <LoadingSpin classContainer="chat-page-container"/>
        </div>
    ) : (
        <div className="message-container">
            <div className="message-container-main">
                <div className="message-wrapper">
                    <ChatHeader privateConvUser={getSecondUserOfPM(convDatas.conv, loggedUser!.id)} />
                    <ul>
                        {
                            convDatas.conv.messages.map((elem, index) =>
                                <MessageItem key={index} isFromChan={false} message={elem} loggedUserIsOwner={true} />
                            )
                        }
                        <div ref={messagesEndRef} /> 
                    </ul>
                </div>
                { userTyping && <p> {userTyping.username} is typing... </p> }
                <div className="message-input-container">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Type Your Message..." value={inputMessage} onChange={(e) => {handleInputChange(e.target.value); optimizedFn(e.target.value)}} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatPrivateMessage;