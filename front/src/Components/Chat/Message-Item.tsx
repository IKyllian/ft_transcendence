import React from "react";
import { Link } from "react-router-dom";
import ProfilPic from "../../Images-Icons/pp.jpg"; 

function MessageItem(props: any) {
    const {userIsSender} = props;
    return (
        <li className={`message-item message-item-${userIsSender ? "right" : "left"}`}> 
            { !userIsSender && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                <p className="message-text"> Ceci est un message </p>
                {
                    !userIsSender && <Link to="/profile" className="message-sender"> Johan </Link>
                }
            </div>
            
        </li>
    );
}

export default MessageItem;