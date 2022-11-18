import { useContext } from "react";
import Avatar from "../Images-Icons/pp.jpg";
import { SocketContext } from "../App";
import { NotificationInterface } from "../Types/Notification-Types";
import { useNavigate } from "react-router-dom";

function NotifGameInvite(props: {notif: NotificationInterface ,notifOnLeave: Function}) {
    const {notif, notifOnLeave} = props;
    const {socket} = useContext(SocketContext);
    const navigate = useNavigate();
    
    const handleAccept = () => {
        socket!.emit("JoinParty", { id: notif.requester.id });
        notifOnLeave();
    }

    const handleDecline = () => {
        notifOnLeave();
    }

    return (
        <div className="game-invite-wrapper">
            <div className="notif-top">
                <img className='profile-avatar' src={Avatar} alt="profil pic" />
                <div className="notif-text">
                    <p> {notif.requester.username} </p>
                    <p> Invited you to play a game </p>
                </div>
            </div>
            <div className="separate-line"></div>
            <div className="notif-bottom">
                <button onClick={() => handleAccept()}> Accept </button>
                <button onClick={() => handleDecline()}> Decline </button>
            </div>
        </div>
    );
}

export default NotifGameInvite;