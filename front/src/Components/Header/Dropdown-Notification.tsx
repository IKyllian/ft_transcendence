import Avatar from "../../Images-Icons/pp.jpg";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { NotificationInterface } from "../../Types/Notification-Types";
import { SocketContext } from "../../App";
import { useContext } from "react";
import { deleteNotification } from "../../Redux/NotificationSlice";

function NotifItem(props: {notification: NotificationInterface}){
    const { notification } = props;

    const {socket} = useContext(SocketContext);
    const dispatch = useAppDispatch();
    
    const handleClick = (response: string) => {
        if (notification.type === "channel_invite")
            socket?.emit("ChannelInviteResponse", {id: notification.id, chanId: notification.channel?.id, response: response});
        dispatch(deleteNotification(notification.id));
    }

    return (
        <div className="notif-dropdown-item">
            <img className='profile-avatar' src={Avatar} alt="profil pic" />
            <div className="notif-content">
                <p> {notification.requester.username} </p>
                <p>
                    {   notification.type === "channel_invite"
                        ?`Invited you to ${notification.channel?.name}`
                        : "Sent you a friend request"
                    }
                </p>
            </div>
            <div className="notif-buttons">
                <button onClick={() => handleClick("accepted")}> Accept </button>
                <button onClick={() => handleClick("declined")}> Decline </button>
            </div>
        </div>
    );
}

function DropdownNotification() {
    const {notifications} = useAppSelector(state => state.notification);
    
    return notifications && notifications.length > 0 ? (
        <div className="notif-dropdown-wrapper">
            {
                notifications.map((elem) => 
                    <NotifItem key={elem.id} notification={elem}  />
                )
            }
        </div>
    ) : (
        <div className="notif-dropdown-wrapper">
            <p className="no-notif"> No Notification </p>
        </div>
    );
}

export default DropdownNotification;