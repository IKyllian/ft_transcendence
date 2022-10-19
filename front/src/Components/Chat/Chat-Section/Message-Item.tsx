import { useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { Link } from "react-router-dom";

import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'
import BlockButton from "../../Utils/Block-Button";
import { ChatMessage, PrivateMessage } from "../../../Types/Chat-Types";
import { userIdIsBlocked } from "../../../Utils/Utils-User";
import BanButton from "../../Utils/Ban-Button";

import { getMessageDateString } from "../../../Utils/Utils-Chat";

function MessageItem(props: {isFromChan: boolean, message: ChatMessage | PrivateMessage, loggedUserIsOwner: boolean, chanId?: number}) {
    const {isFromChan, message, loggedUserIsOwner, chanId} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    let authDatas = useAppSelector((state) => state.auth);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }

    return (
        <li className={`message-item message-item-${message.sender.id === authDatas.currentUser?.id ? "right" : "left"}`}> 
            { message.sender.id !== authDatas.currentUser?.id && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                {
                    userIdIsBlocked(authDatas.currentUser!, message.sender.id) ?
                    <p> Sender is block </p> :
                    <p className="message-text"> { message.content } </p>
                }
                <div className="message-sender">
                    {   
                        message.sender.id !== authDatas.currentUser?.id && isFromChan &&
                        <span className="sender-txt" onClick={() => handleClick()}> {message.sender.username} </span>
                    }
                    <span> {getMessageDateString(message.send_at)} </span>
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
                                    <p> mute </p>
                                   <BanButton senderId={message.sender.id} chanId={chanId!} />
                                </>
                            }
                        </DropdownContainer>
                    }
                </div>       
            </div>
        </li>
    );
}

export default MessageItem;