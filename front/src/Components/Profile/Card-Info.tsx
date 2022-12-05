import { useContext } from 'react';
import { IconMessage, IconBrandAppleArcade, IconSettings } from '@tabler/icons';
import { ProfileState, UserStatus } from '../../Types/User-Types';
import { Link } from "react-router-dom";
import FriendButton from '../Buttons/Friend-Button';
import { SocketContext } from '../../App';
import ExternalImage from '../External-Image';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;

    const {socket} = useContext(SocketContext);

    const invitePlayer = () => {
        if (userState.user)
            socket?.emit("GameInvite", {id: userState.user.id});
    }

    console.log("userState in CARD INFO", userState);

    return userState.user ? (
        <div className="card-info">
            <ExternalImage src={userState.user.avatar} alt="User Avatar" className='profile-avatar' userId={userState.user.id} />
            <div className={`player-status player-status-${userState.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
            <p> {userState.user.username} </p>
            {
                userState.isLoggedUser ? 
                <Link to={`/profile/settings`}>
                    <IconSettings className='settings-icon' />
                </Link>
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