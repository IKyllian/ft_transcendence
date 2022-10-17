import Avatar from "../Images-Icons/pp.jpg";

function NotifGameInvite(props: {notifOnLeave: Function}) {
    const {notifOnLeave} = props;
    const handleAccept = () => {
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
                    <p> Jojo </p>
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