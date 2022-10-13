import ProfilePic from "../../../Images-Icons/pp.jpg";
import { ChannelUser } from "../../../Types/Chat-Types";
import { IconDotsVertical } from '@tabler/icons';
import { useState } from "react";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { Link } from "react-router-dom";
import BlockButton from "../../Utils/Block-Button";
import { useAppSelector } from "../../../Redux/Hooks";

function ChannelUserItem(props: {userDatas: ChannelUser, loggedUserIsOwner: boolean}) {
    const { userDatas, loggedUserIsOwner } = props;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const {currentUser} = useAppSelector((state) => state.auth);

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
                    <Link to={`/profile/${userDatas.user.username}`}>
                        <p> profile </p>
                    </Link>
                    <BlockButton
                        senderIsBlock={currentUser!.blocked.find(elem => elem.id === userDatas.user.id) ? true : false }
                        senderId={userDatas.user.id}
                    />
                    {
                        loggedUserIsOwner && 
                        <> 
                            <p> mute </p>
                            <p> kick </p>
                        </>
                    }
                </DropdownContainer>
            </div>
        </div>
    );
}

function ChannelUsers(props: {users: ChannelUser[], loggedUserIsOwner: boolean}) {
    const { users, loggedUserIsOwner } = props;
    
    return (
        <div className="user-list-container">
            <h3> Owner </h3>
            {
                users.filter((elem) => elem.role === "owner")
                .map((elem) =>
                    <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                )
            }
            <h3> Admins </h3>
            {
                users.filter((elem) => elem.role === "moderator")
                .map((elem) =>
                    <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                )
            }
            <h3> Users </h3>
            {
                users.filter((elem) => elem.role === "clampin")
                .map((elem) =>
                    <ChannelUserItem key={elem.user.id} userDatas={elem} loggedUserIsOwner={loggedUserIsOwner} />
                )
            }
        </div>
    );
}

export default ChannelUsers;