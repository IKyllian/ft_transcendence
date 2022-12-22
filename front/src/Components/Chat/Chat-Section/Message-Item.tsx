import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'
import BlockButton from "../../Buttons/Block-Button";
import { ChatMessage, PrivateMessage } from "../../../Types/Chat-Types";
import { userIdIsBlocked } from "../../../Utils/Utils-User";
import BanButton from "../../Buttons/Ban-Button";
import MuteButton from "../../Buttons/Mute-Button";

import { getMessageDateString, getMessageHour, userIdIsOwner } from "../../../Utils/Utils-Chat";
import { PartyMessage } from "../../../Types/Lobby-Types";
import ExternalImage from "../../External-Image";
import { SocketContext } from "../../../App";

function MessageItem(props: {isFromChan: boolean, message: ChatMessage | PrivateMessage | PartyMessage, isNewSender?: boolean, index?: number}) {
    const {isFromChan, message, isNewSender, index} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const {socket} = useContext(SocketContext);
    const {loggedUserIsOwner, loggedUserIsModerator, channelDatas} = useAppSelector(state => state.channel);
    const {party} = useAppSelector(state => state.party);

    let authDatas = useAppSelector((state) => state.auth);
    const senderIsBlock: boolean | undefined = message.sender ? userIdIsBlocked(authDatas.currentUser!, message.sender.id) : undefined;

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }
    
    return message.sender ? (
        <>
            {
                isNewSender &&
                <li style={isNewSender && index && index > 0 ? {marginTop: '20px'} : {}} className={`message-item-container`}>
                    <ExternalImage src={message.sender.avatar} alt="User Avatar" className='' userId={message.sender.id} />
                    <div className="message-content-wrapper">
                        <div className="message-info-wrapper">
                            <span className="sender-txt" onClick={() => handleClick()}> {message.sender.username} </span>
                            <span> {getMessageDateString(message.send_at)} </span>
                        </div>
                        {
                            senderIsBlock ? 
                            <p className="message-text"> User is Block </p> :
                            <p className="message-text"> { message.content } </p>
                        }
                    </div>
                    {
                        message.sender.id !== authDatas.currentUser?.id &&
                        <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                            <Link to={`/profile/${message.sender.username}`}>
                                <p> profile </p>
                            </Link>
                            {
                                (!party || (party && !party.players.find(elem => elem.user.id === message.sender?.id))) &&
                                <p onClick={() => socket?.emit("PartyInvite", {id: message.sender?.id})}> invite to party </p>
                            }
                            <BlockButton senderId={message.sender.id} />
                            {
                                isFromChan && channelDatas && (loggedUserIsOwner || (loggedUserIsModerator && !userIdIsOwner(message.sender.id, channelDatas.channelUsers))) &&
                                <>
                                    <MuteButton senderId={message.sender.id} chanId={channelDatas.id} usersTimeout={channelDatas.usersTimeout} />
                                    <BanButton senderId={message.sender.id} chanId={channelDatas.id} />
                                </>
                            }
                        </DropdownContainer>
                    }
                </li>
            }
            {
                !isNewSender && !senderIsBlock &&
                <li className="message-item-container-2">
                    <span className="date-message">  {getMessageHour(message.send_at)} </span>
                    <span className="span-message"> { message.content } </span>
                </li>
            }
        </>
    ) : (
        <div className="message-server">
            { !senderIsBlock && <p> {message.content} </p> }
        </div>
    );
}

export default MessageItem;