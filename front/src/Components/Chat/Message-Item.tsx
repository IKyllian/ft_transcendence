import { Link } from "react-router-dom";
import ProfilPic from "../../Images-Icons/pp.jpg"; 

import {ExampleUser} from "../../Interfaces/Interface-User";

function MessageItem(props: {sender: ExampleUser, message: string}) {
    const {sender, message} = props;
    return (
        <li className={`message-item message-item-${sender.name === "Kyllian" ? "right" : "left"}`}> 
            { sender.name !== "Kyllian" && <img src={ProfilPic} alt="profil pic" /> }
            <div className="message-item-info">
                <p className="message-text"> { message } </p>
                {
                    sender.name !== "Kyllian" && <Link to="/profile" className="message-sender"> { sender.name } </Link>
                }
            </div>
        </li>
    );
}

export default MessageItem;