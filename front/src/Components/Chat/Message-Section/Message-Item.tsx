import { useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { Link } from "react-router-dom";

import { UserInterface } from "../../../Types/User-Types";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'

function MessageItem(props: {sender: UserInterface, message: string, loggedUserIsOwner: boolean}) {
    const {sender, message, loggedUserIsOwner} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    let authDatas = useAppSelector((state) => state.auth);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }
    return (
        <li className={`message-item message-item-${sender.id === authDatas.currentUser?.id ? "right" : "left"}`}> 
            { sender.id !== authDatas.currentUser?.id && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                <p className="message-text"> { message } </p>
                {
                    sender.id !== authDatas.currentUser?.id &&
                    <div className="message-sender">
                        <p className="message-sender" onClick={() => handleClick()}> {sender.username} </p>
                        <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                            <Link to={`/profile/${sender.username}`}>
                                <p> profile </p>
                            </Link>
                            <p> block </p>
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