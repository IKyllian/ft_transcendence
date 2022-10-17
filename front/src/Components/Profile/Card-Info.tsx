import { IconEdit, IconUserPlus, IconMessage, IconBrandAppleArcade } from '@tabler/icons';
import { ProfileState } from '../../Types/User-Types';

import ProfilePic from "../../Images-Icons/pp.jpg"
import { Link } from "react-router-dom";
import { SocketContext } from "../../App";
import { useContext } from 'react';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;

    const {socket} = useContext(SocketContext);
    const inviteTest = (id: number) => {
        socket?.emit("ChannelInvite", {
            chanId: 11,
            userId: id,
        });
    }

    return (
        <div className="card-info">
            <img className='profile-avatar' src={ProfilePic} alt="profil pic" />
            <div className="player-status player-status-online"> </div>
            <p> {userState.user.username} </p>
            {
                userState.isLoggedUser ? <IconEdit /> : 
                <>
                    <IconUserPlus onClick={() => inviteTest(userState.user.id)} className="friend-icone friend-icone-add" />
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