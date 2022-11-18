import { useState } from "react";
import { Link } from "react-router-dom";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { ChannelUser, UserTimeout } from "../../../Types/Chat-Types";

import DropdownContainer from "../../Utils/Dropdown-Container";
import BlockButton from "../../Buttons/Block-Button";
import MuteButton from "../../Buttons/Mute-Button";
import BanButton from "../../Buttons/Ban-Button";
import { useAppSelector } from "../../../Redux/Hooks";
import { UserStatus } from "../../../Types/User-Types";

function UserSidebarItem(props: {user: ChannelUser, usersTimeout: UserTimeout[], loggedUserIsOwner: boolean}) {
    const { user, usersTimeout, loggedUserIsOwner } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const {currentUser} = useAppSelector(state => state.auth);

    const handleClick = () => {
        setShowDropdown(!showDropdown);
    }

    return (
        <li>
            <div className="avatar-container">
                <img className='user-avatar' src={ProfilPic} alt="profil pic" />
                <div className="user-status">
                    <div className={`${user.user.status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                </div>
            </div>
            <div className={`${currentUser?.id !== user.user.id ? "username-wrapper" : ""}`} onClick={() => handleClick()}>
                { user.user.username }
                {
                    currentUser?.id !== user.user.id &&
                    <DropdownContainer show={showDropdown} onClickOutside={handleClick}>
                        <Link to={`/profile/${user.user.username}`}>
                            <p> profile </p>
                        </Link>
                        <BlockButton senderId={user.user.id} />
                        {
                            loggedUserIsOwner &&
                            <>
                                <MuteButton senderId={user.user.id} chanId={user.channelId} usersTimeout={usersTimeout} />
                                <BanButton senderId={user.user.id} chanId={user.channelId} />
                            </>
                        }
                    </DropdownContainer>
                }
            </div>
        </li>
    );
}

function UsersSidebar(props: {usersList: ChannelUser[], usersTimeout: UserTimeout[], loggedUserIsOwner: boolean}) {
    const { usersList, usersTimeout, loggedUserIsOwner } = props;
    return (
        <div className="users-sidebar">
            <div className="users-sidebar-wrapper">
                <h3> Owner - {usersList.filter((elem) => elem.role === "owner").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "owner")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem} usersTimeout={usersTimeout} loggedUserIsOwner={loggedUserIsOwner}  />
                        )
                    }
                </ul>
                <h3> Moderator - {usersList.filter((elem) => elem.role === "moderator").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "moderator")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem} usersTimeout={usersTimeout} loggedUserIsOwner={loggedUserIsOwner}  />
                        )
                    }
                </ul>
                <h3> Users - {usersList.filter((elem) => elem.role === "clampin").length} </h3>
                <ul>
                    {
                        usersList.filter((elem) => elem.role === "clampin")
                        .map((elem) =>
                            <UserSidebarItem key={elem.user.id} user={elem} usersTimeout={usersTimeout} loggedUserIsOwner={loggedUserIsOwner} />
                        )
                    }
                </ul>
            </div>
        </div>
    );
}

export default UsersSidebar;