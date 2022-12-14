import Avatar from "../../Images-Icons/pp.jpg";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { NotificationInterface, notificationType } from "../../Types/Notification-Types";
import { SocketContext } from "../../App";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { IconX, IconCheck } from "@tabler/icons";
import ExternalImage from "../External-Image";

function NotifItem(props: {notification: NotificationInterface}){
    const { notification } = props;

    const {socket} = useContext(SocketContext);
    const dispatch = useAppDispatch();
    
    const handleClick = (response: string) => {
        if (notification.type === notificationType.CHANNEL_INVITE)
            socket?.emit("ChannelInviteResponse", {id: notification.id, chanId: notification.channel?.id, response: response});
        else
            socket?.emit("FriendRequestResponse", {id: notification.requester.id, response: response})
    }

    return (
        <div className="notif-dropdown-item">
            <IconX className="delete-notif-icon" />
            <ExternalImage src={notification.requester.avatar} alt="User Avatar" className='profile-avatar' userId={notification.requester.id} />
            <div className="notif-content">
                <Link to={`/profile/${notification.requester.username}`}> {notification.requester.username} </Link>
                <p>
                    {   notification.type === notificationType.CHANNEL_INVITE
                        ?`Invited you to ${notification.channel?.name}`
                        : "Sent you a friend request"
                    }
                </p>
            </div>
            <div className="notif-buttons">
                <IconCheck onClick={() => handleClick("accepted")} />
                <IconX onClick={() => handleClick("declined")} />
            </div>
        </div>
    );
}

function DropdownNotification() {
    const {notifications} = useAppSelector(state => state.notification);
    
    return notifications && notifications.find(elem => elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PARTY_INVITE  && elem.type !== notificationType.PRIVATE_MESSAGE) ? (
        <div className="notif-dropdown-wrapper">
            {
                notifications.map((elem) => {
                    if (elem.type !== notificationType.PARTY_INVITE && elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PRIVATE_MESSAGE)
                        return <NotifItem key={elem.id} notification={elem} />
                })
            }
        </div>
    ) : (
        <div className="notif-dropdown-wrapper">
            <p className="no-notif"> No Notification </p>
        </div>
    );
}

export default DropdownNotification;