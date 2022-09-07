import { Link } from "react-router-dom";
import ProfilPic from "../../../Images-Icons/pp.jpg"; 

import {ExampleUser} from "../../../Interfaces/Interface-User";

function MessageItem(props: {sender: ExampleUser, message: string}) {
    const {sender, message} = props;
    return (
        <li className={`message-item message-item-${sender.id === 1 ? "right" : "left"}`}> 
            { sender.id !== 1 && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                <p className="message-text"> { message } </p>
                {
                    sender.id !== 1 && <Link to="/profile" className="message-sender"> { sender.name } </Link>
                }
            </div>
        </li>
    );
}

export default MessageItem;