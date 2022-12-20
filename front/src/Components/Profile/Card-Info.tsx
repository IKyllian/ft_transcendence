import { useContext } from 'react';
import { IconMessage, IconSettings, IconEye } from '@tabler/icons';
import { ProfileState, UserStatus } from '../../Types/User-Types';
import { Link } from "react-router-dom";
import FriendButton from '../Buttons/Friend-Button';
import { SocketContext } from '../../App';
import ExternalImage from '../External-Image';
import BlockButton from '../Buttons/Block-Button';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;

    const {socket} = useContext(SocketContext);

    const spectateClick = () => {
        socket?.emit("get_gameinfo", userState.user.in_game_id);
    }

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
                <div className='icons-wrapper'>
                    <FriendButton secondUserId={userState.user.id} relationStatus={userState.relationStatus!} />
                    <Link className="send-message-icon" to="/chat" state={{userIdToSend: userState.user.id}}>
                        <IconMessage />
                    </Link>
                    <BlockButton senderId={userState.user.id} isIconButton={true} />
                    { userState.user.in_game_id !== null && <IconEye onClick={() => spectateClick()} className='spectate-icon' /> }
                </div>
            }
        </div>
    ) : (
        <> </>
    );
}

export default CardInfo;