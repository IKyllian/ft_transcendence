import { useState } from "react";
import { IconDotsVertical } from '@tabler/icons';

import { UserInterface } from "../../../Types/User-Types";
import FriendListModal from "../Friend-Dropdown";
import Avatar from "../../../Images-Icons/pp.jpg";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../Redux/Hooks";
import ExternalImage from "../../External-Image";

function FriendItem(props: {name: string, avatar: string | null, userProfileId: number}) {
    const {name, avatar, userProfileId} = props;

    const [showModal, setShowModal] = useState<boolean>(false);
    const {currentUser} = useAppSelector(state => state.auth);

    const handleClick = () => {
        setShowModal(!showModal);
    }

    return (
        <div className="friend-item">
            <div className="friend-content">
                <ExternalImage src={avatar} alt="User Avatar" className="friend-avatar" userId={userProfileId} />
                <Link to={`/profile/${name}`}>
                    { name }
                </Link>
            </div>
            {
                currentUser?.id === userProfileId && 
                <div className="friend-item-menu">
                    <IconDotsVertical onClick={() => handleClick()} />
                    <FriendListModal show={showModal} onClickOutside={() => {setShowModal(false)}}/>
                </div>
            }
        </div>
    );
}

function BlockFriends(props: {friendList: UserInterface[], userProfileId: number}) {
    const {friendList, userProfileId} = props;
    return friendList.length > 0 ? (
        <div className="profile-block-wrapper friends-list">
            {
                friendList.map((elem, index) =>
                    <FriendItem key={index} name={elem.username} avatar={elem.avatar} userProfileId={userProfileId} />
                )
            }
        </div>
    ) : (
        <p className="err-no-datas"> No Friends yet </p>
    );
}

export default BlockFriends;