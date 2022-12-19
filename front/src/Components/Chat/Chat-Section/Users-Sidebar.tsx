import { useContext } from "react";
import { Link } from "react-router-dom";
import { ChannelUser } from "../../../Types/Chat-Types";
import { UserStatus } from "../../../Types/User-Types";
import ExternalImage from "../../External-Image";
import { IconEye } from "@tabler/icons";
import { SocketContext } from "../../../App";

function UserSidebarItem(props: {user: ChannelUser}) {
    const { user } = props;
    const {socket} = useContext(SocketContext);

    return (
        <li>
            <div className="avatar-container">
            <ExternalImage src={user.user.avatar} alt="User Avatar" className='user-avatar' userId={user.user.id} />
                <div className="user-status">
                    <div className={`${user.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                </div>
            </div>
            <Link to={`/profile/${user.user.username}`}>
                { user.user.username }
            </Link>
            { user.user.in_game_id !== null && <IconEye onClick={() => socket?.emit("get_gameinfo", user.user.in_game_id)} className='spectate-icon' /> }
        </li>
    );
}

function UsersSidebar(props: {usersList: ChannelUser[]}) {
    const { usersList } = props;
    return (
        <div className="users-sidebar">
            <div className="users-sidebar-wrapper">
                <h3> Owner - {usersList.filter((elem) => elem.role === "owner").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "owner")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem}  />
                        )
                    }
                </ul>
                <h3> Moderator - {usersList.filter((elem) => elem.role === "moderator").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "moderator")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem}  />
                        )
                    }
                </ul>
                <h3> Users - {usersList.filter((elem) => elem.role === "clampin").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "clampin")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem} />
                        )
                    }
                </ul>
            </div>
        </div>
    );
}

export default UsersSidebar;