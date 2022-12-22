import { TimeoutType } from "../../../Types/Chat-Types";
import { useContext } from "react";
import { SocketContext } from "../../../App";
import ExternalImage from "../../External-Image";
import { useAppSelector } from "../../../Redux/Hooks";
import { Link } from "react-router-dom";
import { getBanDateString } from "../../../Utils/Utils-Chat";

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
        <table> 
            <thead>
                <tr>
                    <th> User </th>
                    <th> Ban Time </th>
                </tr>
            </thead>
            <tbody>
                {
                    usersBan.map(elem => 
                        <tr key={elem.id}>
                            <td>
                                <div className="user-info">
                                    <ExternalImage src={elem.user.avatar} alt="User Avatar" className='user-avatar' userId={elem.user.id} />
                                    <Link to={`/profile/${elem.user.username}`}>
                                        { elem.user.username }
                                    </Link>
                                </div>
                            
                            </td>
                            <td>
                                { !elem.until ? "Perma ban" : getBanDateString(elem.until.toString()) }
                            </td>
                            <td>
                                <button onClick={() => handleClick(elem.user.id)}> Unban </button>
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </table>
    ) : (
        <div className="user-list-container">
            <p> No user ban yet </p>
        </div>
    );
}

export default ChannelBanUser;