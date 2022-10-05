import ProfilePic from "../../../Images-Icons/pp.jpg";
import { ChannelUser } from "../../../Types/Chat-Types";
import { IconDotsVertical } from '@tabler/icons';
import { useState } from "react";
import DropdownContainer from "../../Utils/Dropdown-Container";

function ChannelUserItem(props: {userDatas: ChannelUser}) {
    const { userDatas } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const closeDropdown = () => {
        setShowDropdown(false);
    }

    return (
        <div className="setting-user-item">
            <div className="profil-container">
                <img className='profile-avatar' src={ProfilePic} alt="profil pic" />
                <p> {userDatas.user.username } </p>
            </div>
            <div className="user-dropdown-container">
                <IconDotsVertical onClick={() => setShowDropdown(!showDropdown)} />
                <DropdownContainer show={showDropdown} onClickOutside={closeDropdown}>
                    <p> profile </p>
                    <p> block </p>
                    <p> mute </p>
                    <p> kick </p>
                </DropdownContainer>
            </div>
        </div>
    );
}

function ChannelUsers(props: {users: ChannelUser[]}) {
    const { users } = props;
    
    return (
        <div className="user-list-container">
            <h3> Owner </h3>
            {
                users.filter((elem) => elem.role === "owner")
                .map((elem) =>
                    <ChannelUserItem key={elem.user.id} userDatas={elem} />
                )
            }
            <h3> Users </h3>
            {
                users.filter((elem) => elem.role === "clampin")
                .map((elem) =>
                    <ChannelUserItem key={elem.user.id} userDatas={elem} />
                )
            }
        </div>
    );
}

export default ChannelUsers;