import { useState } from "react";
import { IconDotsVertical } from '@tabler/icons';

import { UserInterface } from "../../../Types/User-Types";
import FriendListModal from "../Friend-Dropdown";

function FriendItem(props: {name: string, profilPic: string}) {
    const {name, profilPic} = props;

    const [showModal, setShowModal] = useState<boolean>(false);

    const handleClick = () => {
        setShowModal(!showModal);
    }

    return (
        <div className="friend-item">
            <div className="friend-content">
                <img className='friend-avatar' src={profilPic} alt="profil pic" />
                <p> { name }</p>
            </div>
            <div className="friend-item-menu">
                <IconDotsVertical onClick={() => handleClick()} />
                <FriendListModal show={showModal} onClickOutside={() => {setShowModal(false)}}/>
            </div>
        </div>
    );
}

function BlockFriends(props: {userDatas: UserInterface}) {
    const {userDatas} = props;
    return (
        // <div className="profile-block-wrapper friends-list">
        //     {
        //         friendsDatas.map((elem, index) =>
        //             <FriendItem key={index} name={elem.username} profilPic={elem.profilPic} />
        //         )
        //     }
        // </div>
        <p className="err-no-datas"> No Friends yet </p>
    );
}

export default BlockFriends;