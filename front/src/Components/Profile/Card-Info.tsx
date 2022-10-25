import { IconEdit, IconMessage, IconBrandAppleArcade } from '@tabler/icons';
import { ProfileState } from '../../Types/User-Types';

import ProfilePic from "../../Images-Icons/pp.jpg"
import { Link } from "react-router-dom";
import FriendButton from '../Buttons/Friend-Button';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;
    
    return (
        <div className="card-info">
            <img className='profile-avatar' src={ProfilePic} alt="profil pic" />
            <div className="player-status player-status-online"> </div>
            <p> {userState.user.username} </p>
            {
                userState.isLoggedUser ? <IconEdit /> : 
                <>
                    <FriendButton secondUserId={userState.user.id} relationStatus={userState.relationStatus!} />
                    <Link className="send-message-icon" to="/chat" state={{userIdToSend: userState.user.id}}>
                        <IconMessage />
                    </Link>
                    <Link className="fight-button" to="/profile">
                        Play
                        <IconBrandAppleArcade />
                    </Link>
                     {/* <Link className="fight-button" to="/profile">
                        Watch Game */}
                        {/* <IconEye /> */}
                    {/* </Link> */}
                </>
            }
        </div>
    );
}

export default CardInfo;