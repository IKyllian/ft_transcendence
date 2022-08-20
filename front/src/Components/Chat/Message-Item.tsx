import React from "react";
import ProfilPic from "../../Images-Icons/pp.jpg"; 

function MessageItem(props: any) {
    const {userIsSender} = props;
    return (
        <li className={`message-item message-item-${userIsSender ? "right" : "left"}`}> 
            { !userIsSender && <img src={ProfilPic} alt="profil pic" /> }
            <p> Ceci est un message </p>
        </li>
    );
}

export default MessageItem;