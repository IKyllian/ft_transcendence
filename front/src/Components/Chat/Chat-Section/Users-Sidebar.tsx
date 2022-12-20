import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ChannelUser } from "../../../Types/Chat-Types";
import { UserStatus } from "../../../Types/User-Types";
import ExternalImage from "../../External-Image";
import { IconEye } from "@tabler/icons";
import { SocketContext } from "../../../App";
import DropdownContainer from "../../Utils/Dropdown-Container";
import BlockButton from "../../Buttons/Block-Button";
import MuteButton from "../../Buttons/Mute-Button";
import BanButton from "../../Buttons/Ban-Button";
import { useAppSelector } from "../../../Redux/Hooks";

function UserSidebarItem(props: {user: ChannelUser}) {
    const { user } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const {socket} = useContext(SocketContext);
    const {currentUser} = useAppSelector(state => state.auth);
    const {channelDatas, loggedUserIsOwner, loggedUserIsModerator} = useAppSelector(state => state.channel);
    const {party} = useAppSelector(state => state.party);

    const onCloseDropdown = () => {
        setShowDropdown(false);
    }

    return channelDatas ? (
        <li>
            <div className="avatar-container">
            <ExternalImage src={user.user.avatar} alt="User Avatar" className='user-avatar' userId={user.user.id} />
                <div className="user-status">
                    <div className={`${user.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                </div>
            </div>
            <p onClick={() => setShowDropdown(prev => !prev) }> { user.user.username } </p>
            { user.user.in_game_id !== null && <IconEye onClick={() => socket?.emit("get_gameinfo", user.user.in_game_id)} className='spectate-icon' /> }
            {
                user.user.id !== currentUser?.id &&
                <DropdownContainer show={showDropdown} onClickOutside={onCloseDropdown} alignToLeft={true} >
                    <Link to={`/profile/${user.user.username}`}>
                        <p> profile </p>
                    </Link>
                    { 
                        !party || (party && !party.players.find(elem => elem.user.id === user.user.id)) &&
                        <p onClick={() => socket?.emit("PartyInvite", {id: user.user?.id})}> invite to party </p>
                    }
                    <BlockButton senderId={user.user.id} />
                    {
                        (loggedUserIsOwner || (loggedUserIsModerator && user.role !== "owner")) &&
                        <>
                            <MuteButton senderId={user.user.id} chanId={channelDatas.id} usersTimeout={channelDatas.usersTimeout} />
                            <BanButton senderId={user.user.id} chanId={channelDatas.id} />
                        </>
                    }
                </DropdownContainer>
            }
        </li>
    ) : (
        <> </>
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