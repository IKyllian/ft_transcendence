import Avatar from "../../../Images-Icons/pp.jpg";
import { TimeoutType, UserTimeout } from "../../../Types/Chat-Types";
import { useContext } from "react";
import { SocketContext } from "../../../App";
import ExternalImage from "../../External-Image";
import { useAppSelector } from "../../../Redux/Hooks";

function ChannelBanUser() {
    const { channelDatas } = useAppSelector((state) => state.channel);
    const usersBan = channelDatas?.usersTimeout.filter(elem => elem.type === TimeoutType.BAN);
    const {socket} = useContext(SocketContext);

    const handleClick = (userBanId: number) => {
        socket?.emit("Unban", {
            userId: userBanId,
            chanId: channelDatas?.id,
        });
    }

    return usersBan && usersBan.length > 0 ? (
        <div className="user-list-container">
            {
                usersBan.map(elem => 
                    <div key={elem.id} className="setting-user-item">
                        <div className="profil-container">
                            <ExternalImage src={elem.user.avatar} alt="User Avatar" className='profile-avatar' userId={elem.user.id} />
                            <p> { elem.user.username } </p>
                        </div>
                        <div className="unban-button-wrapper"> 
                            <button onClick={() => handleClick(elem.user.id)}> Unban </button>
                            <p> 
                                {
                                    !elem.until ? "Perma ban" : elem.until.toString()
                                }
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    ) : (
        <div className="user-list-container">
            <p> No user ban yet </p>
        </div>
    );
}

export default ChannelBanUser;