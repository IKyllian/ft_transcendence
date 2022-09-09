import { useState } from "react";
import ProfilPic from "../../../Images-Icons/pp.jpg"; 

import { ExampleUser } from "../../../Interfaces/Interface-User";
import DropdownContainer from "../../Dropdown-Container";

function MessageItem(props: {sender: ExampleUser, message: string}) {
    const {sender, message} = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }
    return (
        <li className={`message-item message-item-${sender.id === 1 ? "right" : "left"}`}> 
            { sender.id !== 1 && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                <p className="message-text"> { message } </p>
                {
                    sender.id !== 1 &&
                    <div className="message-sender">
                        <p className="message-sender" onClick={() => handleClick()}> {sender.name} </p>     
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