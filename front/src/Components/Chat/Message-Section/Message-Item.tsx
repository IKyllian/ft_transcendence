import { useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg"; 

import { ExampleUser, UserInterface } from "../../../Types/User-Types";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { useAppSelector } from '../../../Redux/Hooks'

function MessageItem(props: {sender: UserInterface, message: string}) {
    const {sender, message} = props;
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
                            <p> profile </p>
                            <p> block </p>
                            <p> mute </p>
                            <p> kick </p>
                        </DropdownContainer>
                    </div>
                }           
            </div>
        </li>
    );
}

export default MessageItem;