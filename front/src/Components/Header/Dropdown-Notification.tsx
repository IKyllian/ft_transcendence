import Avatar from "../../Images-Icons/pp.jpg";

function NotifItem(props: {textNotif: string, textButton: string}){
    const { textNotif, textButton } = props;
    return (
        <div className="notif-dropdown-item">
            <img className='profile-avatar' src={Avatar} alt="profil pic" />
            <div className="notif-content">
                <p> Jojo </p>
                <p> {textNotif} </p>
            </div>
            <div className="notif-buttons">
                <button> {textButton} </button>
                <button> Decline </button>
            </div>
        </div>
    );
}

function DropdownNotification() {
    return (
        <div className="notif-dropdown-wrapper">
            <NotifItem textNotif="Sent you a friend request" textButton="Accept" />
            <NotifItem textNotif="Invited you to a channel" textButton="Join" />
            <NotifItem textNotif="Invited you to a channel" textButton="Join" />
            <NotifItem textNotif="Sent you a friend request" textButton="Accept" />
            <NotifItem textNotif="Sent you a friend request" textButton="Accept" />
            <NotifItem textNotif="Sent you a friend request" textButton="Accept" />
        </div>
    );
}

export default DropdownNotification;