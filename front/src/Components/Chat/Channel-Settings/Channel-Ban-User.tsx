import Avatar from "../../../Images-Icons/pp.jpg";
import { BannedUser } from "../../../Types/Chat-Types";
import { fetchUnbanUser } from "../../../Api/Chat/Chat-Action";
import { Channel } from "../../../Types/Chat-Types";

function ChannelBanUser(props: {chanId: number, usersBan: BannedUser[], loggedUserToken: string, setChannelDatas: Function}) {
    const { usersBan, chanId, loggedUserToken, setChannelDatas } = props;

    const handleClick = (userBanId: number) => {
        fetchUnbanUser(loggedUserToken, chanId, userBanId, setChannelDatas);
    }

    return usersBan.length > 0 ? (
        <div className="user-list-container">
            {
                usersBan.map(elem => 
                    <div key={elem.id} className="setting-user-item">
                        <div className="profil-container">
                            <img className='profile-avatar' src={Avatar} alt="profil pic" />
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