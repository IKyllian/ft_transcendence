import { useEffect, useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { Link } from "react-router-dom";

import { UserInterface } from "../../../Types/User-Types";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'
import BlockButton from "../../Utils/Block-Button";

function MessageItem(props: {sender: UserInterface, message: string, loggedUserIsOwner: boolean}) {
    const {sender, message, loggedUserIsOwner} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [senderIsBlock, setSenderIdBlock] = useState<boolean>(false); 

    let authDatas = useAppSelector((state) => state.auth);

    useEffect(() => {
        // console.log("message", message, "sender", sender);
        if (authDatas.currentUser?.blocked.find(elem => elem.id === sender.id))
            setSenderIdBlock(true);
        else
            setSenderIdBlock(false);
    }, [authDatas.currentUser?.blocked]);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }

    return (
        <li className={`message-item message-item-${sender.id === authDatas.currentUser?.id ? "right" : "left"}`}> 
            { sender.id !== authDatas.currentUser?.id && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                {
                    senderIsBlock ?
                    <p> Sender is block </p> :
                    <p className="message-text"> { message } </p>
                }
                {
                    sender.id !== authDatas.currentUser?.id &&
                    <div className="message-sender">
                        <p className="message-sender" onClick={() => handleClick()}> {sender.username} </p>
                        <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                            <Link to={`/profile/${sender.username}`}>
                                <p> profile </p>
                            </Link>
                            <BlockButton senderIsBlock={senderIsBlock} senderId={sender.id} />
                            {
                                loggedUserIsOwner &&
                                <>
                                    <p> mute </p>
                                    <p> kick </p>
                                </>
                            }
                        </DropdownContainer>
                    </div>
                }           
            </div>
        </li>
    );
}

export default MessageItem;