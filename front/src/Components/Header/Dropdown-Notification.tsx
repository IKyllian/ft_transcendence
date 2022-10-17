import Avatar from "../../Images-Icons/pp.jpg";
import { useAppSelector } from "../../Redux/Hooks";
import { NotificationInterface } from "../../Types/Notification-Types";


function NotifItem(props: {notification: NotificationInterface}){
    const { notification } = props;
    
    const handleAccept = () => {
        
    }

    const handleDecline = () => {
        
    }
    return (
        <div className="notif-dropdown-item">
            <img className='profile-avatar' src={Avatar} alt="profil pic" />
            <div className="notif-content">
                <p> {notification.requester.username} </p>
                <p> {notification.type === "channel_invite" ? `Invited you to ${notification.channel?.name}` : "Sent you a friend request"} </p>
            </div>
            <div className="notif-buttons">
                <button onClick={() => handleAccept()}> Accept </button>
                <button onClick={() => handleDecline()}> Decline </button>
            </div>
        </div>
    );
}

function DropdownNotification() {
    const {notifications} = useAppSelector(state => state.notification);
    
    return notifications ? (
        <div className="notif-dropdown-wrapper">
            {
                notifications.map((elem) => 
                    <NotifItem key={elem.id} notification={elem}  />
                )
            }
        </div>
    ) : (
        <div className="notif-dropdown-wrapper">
            No Notification
        </div>
    );
}

export default DropdownNotification;