import { useState } from "react";

import { IconDotsVertical } from '@tabler/icons';

import FriendListModal from "../Friend-List-Modal";

function FriendItem(props: {name: string, profilPic: string}) {
    const {name, profilPic} = props;

    const [showModal, setShowModal] = useState<boolean>(false);

    const handleClick = () => {
        if (showModal)
            setShowModal(false);
        else
            setShowModal(true);
        
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

export default FriendItem;