import { useContext } from 'react';
import { IconEdit, IconMessage, IconBrandAppleArcade, IconSettings } from '@tabler/icons';
import { ProfileState, UserStatus } from '../../Types/User-Types';
import Avatar from "../../Images-Icons/pp.jpg"
import { Link } from "react-router-dom";
import FriendButton from '../Buttons/Friend-Button';
import { SocketContext } from '../../App';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;

    const {socket} = useContext(SocketContext);

    const invitePlayer = () => {
        if (userState.user)
            socket?.emit("GameInvite", {id: userState.user.id});
    }

    return userState.user ? (
        <div className="card-info">
            {/* <img className='profile-avatar' src={Avatar} alt="profil pic" /> */}
            <img className='profile-avatar' src={userState.user.avatar} alt="profil pic" />
            <div className={`player-status player-status-${userState.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
            <p> {userState.user.username} </p>
            {
                userState.isLoggedUser ? 
                <>
                    {/* <IconEdit /> */}
                    <Link to={`/profile/${userState.user.username}/settings`}>
                        <IconSettings className='settings-icon' />
                    </Link>
                </>
                : 
                <>
                    <FriendButton secondUserId={userState.user.id} relationStatus={userState.relationStatus!} />
                    <Link className="send-message-icon" to="/chat" state={{userIdToSend: userState.user.id}}>
                        <IconMessage />
                    </Link>
                    <Link onClick={() => invitePlayer()} className="fight-button" to="/lobby">
                        Play
                        <IconBrandAppleArcade />
                    </Link>
                </>
            }
        </div>
    ) : (
        <> </>
    );
}

export default CardInfo;