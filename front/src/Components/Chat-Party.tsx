import { IconSend } from "@tabler/icons";
import { useContext, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { SocketContext } from "../App";
import { useAppSelector } from "../Redux/Hooks";
import ChatHeader from "./Chat/Chat-Section/Chat-Header";
import MessageItem from "./Chat/Chat-Section/Message-Item";   

function ChatParty() {
    const { register, handleSubmit, reset } = useForm<{inputMessage: string}>();
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const { party } = useAppSelector(state => state.party);
    const { socket } = useContext(SocketContext);

    const messageSubmit = handleSubmit((data) => {
        if (data.inputMessage.length > 0) {
            socket?.emit("NewPartyMessage", {
                content: data.inputMessage,
            });
            reset();
        }
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        scrollToBottom();
    }, [party?.messages])

    return party ? (
        <div className="chat-party-sidebar">
            <div className="message-container-main" style={{width: '100%'}}>
                <ChatHeader isPartyChat={true} />
                <ul id="chat-message-wrapper" className="chat-messages-wrapper" >
                    {
                        party.messages.map((elem, index) => {
                            const dateMessage = new Date(elem.send_at);
                            if (index === 0 || !elem.sender || party.messages[index - 1].sender?.id !== elem.sender?.id || (dateMessage.getDate() !== (new Date(party.messages[index - 1].send_at).getDate())))
                                return <MessageItem key={index} isFromChan={false} message={elem} isNewSender={true} index={index} />
                            else
                                return <MessageItem key={index} isFromChan={false} message={elem} isNewSender={false} index={index} />
                        })
                    }
                    <div ref={messagesEndRef} />
                </ul>
                <div className="message-input-container" onSubmit={messageSubmit}>
                    <form>
                        <input autoComplete="off" type="text" placeholder="Type Your Message..." {...register('inputMessage', {minLength: 1})} />
                        <button type="submit"> <IconSend /> </button>
                    </form>
                    
                </div>
            </div>
        </div>
    ) : (
        <> </>
    );
}

export default ChatParty;