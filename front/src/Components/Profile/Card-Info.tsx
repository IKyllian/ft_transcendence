import { IconEdit, IconMessage, IconBrandAppleArcade } from '@tabler/icons';
import { ProfileState, UserStatus } from '../../Types/User-Types';

import ProfilePic from "../../Images-Icons/pp.jpg"
import { Link } from "react-router-dom";
import FriendButton from '../Buttons/Friend-Button';
import { useContext, useState } from 'react';
import { SocketContext } from '../../App';
import { fetchUploadAvatar } from '../../Api/Profile/Profile-Fetch';
import { useAppSelector } from '../../Redux/Hooks';

function CardInfo(props: {userState: ProfileState}) {
    const { userState } = props;
    const { token } = useAppSelector(state => state.auth);
    const [inputFile, setInputFile] = useState<File | undefined>(undefined);

    const {socket} = useContext(SocketContext);

    const invitePlayer = () => {
        socket?.emit("GameInvite", {id: userState.user.id});
    }

    const onSubmit = (e: any) => {
        e?.preventDefault();
        if (inputFile) {
            let formData = new FormData();
            formData.append("image", inputFile);
            fetchUploadAvatar(token, formData);
        }
    }
    
    const onFileChange = (e: any) => {
        setInputFile(e.target.files[0]);
    }    
    return (
        <div className="card-info">
            <img className='profile-avatar' src={userState.user.avatar} alt="profil pic" />
            <form onSubmit={(e) => onSubmit(e)}>
                <input type="file" onChange={(e) => onFileChange(e)} />
                <button type='submit'> Submit </button>
            </form>
            <div className={`player-status player-status-${userState.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
            <p> {userState.user.username} </p>
            {
                userState.isLoggedUser ? <IconEdit /> : 
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
    );
}

export default CardInfo;