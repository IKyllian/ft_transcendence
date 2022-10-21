import ProfilePic from "../../../Images-Icons/pp.jpg";
import { ChannelUser } from "../../../Types/Chat-Types";
import { IconDotsVertical } from '@tabler/icons';
import { useState } from "react";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { Link } from "react-router-dom";
import BlockButton from "../../Utils/Block-Button";
import RoleButton from "../../Utils/Role-Button";

export function ChannelUserItem(props: {userDatas: ChannelUser, loggedUserIsOwner: boolean}) {
    const { userDatas, loggedUserIsOwner } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const closeDropdown = () => {
        setShowDropdown(false);
    }

    return (
        <li className="setting-user-item">
            <div className="profil-container">
                <img className='profile-avatar' src={ProfilePic} alt="profil pic" />
                <p> {userDatas.user.username } </p>
            </div>
            <div className="user-dropdown-container">
                <IconDotsVertical onClick={() => setShowDropdown(!showDropdown)} />
                <DropdownContainer show={showDropdown} onClickOutside={closeDropdown}>
                    <Link to={`/profile/${userDatas.user.username}`}>
                        <p> profile </p>
                    </Link>
                    <BlockButton
                        senderId={userDatas.user.id}
                    />
                    <RoleButton sender={userDatas} />
                    {
                        loggedUserIsOwner &&
                        <> 
                            <p> mute </p>
                            <p> kick </p>
                        </>
                    }
                </DropdownContainer>
            </div>
        </li>
    );
}

function ChannelUsers(props: {users: ChannelUser[], loggedUserIsOwner: boolean}) {
    const { users, loggedUserIsOwner } = props;
    
    return (
        <div className="user-list-container">
            <h3> Owner </h3>
            <ul>
                {
                    users.filter((elem) => elem.role === "owner")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                    )
                }
            </ul>
            <h3> Admins </h3>
            <ul>
                {
                    users.filter((elem) => elem.role === "moderator")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                    )
                }
            </ul>
            <h3> Users </h3>
            <ul>
                {
                    users.filter((elem) => elem.role === "clampin")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                    )
                }
            </ul>
        </div>
    );
}

export default ChannelUsers;