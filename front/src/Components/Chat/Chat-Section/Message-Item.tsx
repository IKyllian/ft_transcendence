import { useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { Link } from "react-router-dom";

import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'
import BlockButton from "../../Utils/Block-Button";
import { Channel, ChatMessage, PrivateMessage } from "../../../Types/Chat-Types";
import { userIdIsBlocked } from "../../../Utils/Utils-User";
import BanButton from "../../Utils/Ban-Button";
import MuteButton from "../../Utils/Mute-Button";

import { getMessageDateString, getMessageHour } from "../../../Utils/Utils-Chat";

function MessageItem(props: {isFromChan: boolean, message: ChatMessage | PrivateMessage, loggedUserIsOwner: boolean, chanId?: Channel, isNewSender?: boolean, index?: number}) {
    const {isFromChan, message, loggedUserIsOwner, chanId, isNewSender, index} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    let authDatas = useAppSelector((state) => state.auth);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }
    
    return message.sender ? (
        <>
            {
                isNewSender &&
                <li style={isNewSender && index && index > 0 ? {marginTop: '20px'}: {}} className="message-item-container">
                    <img src={ProfilPic} alt="profil pic" />
                    <div className="message-content-wrapper">
                        <div className="message-info-wrapper">
                            <span className="sender-txt" onClick={() => handleClick()}> {message.sender.username} </span>
                            <span> {getMessageDateString(message.send_at)} </span>
                        </div>
                        <p className="message-text"> { message.content } </p>
                    </div>
                    {
                        isFromChan && message.sender.id !== authDatas.currentUser?.id &&
                        <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                            <Link to={`/profile/${message.sender.username}`}>
                                <p> profile </p>
                            </Link>
                            <BlockButton senderId={message.sender.id} />
                            {
                                loggedUserIsOwner &&
                                <>
                                    <MuteButton senderId={message.sender.id} chan={chanId!} />
                                    <BanButton senderId={message.sender.id} chanId={chanId!.id} />
                                </>
                            }
                        </DropdownContainer>
                    }
                </li>
            }
            {
                !isNewSender &&
                <li className="message-item-container-2">
                    <span className="date-message">  {getMessageHour(message.send_at)} </span>
                    <span> { message.content } </span>
                </li>
                
            }
           
        </>
    ) : (
        <div className="message-server">
            <p> {message.content} </p>
        </div>
    );
}

export default MessageItem;