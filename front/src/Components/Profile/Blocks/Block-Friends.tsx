import { friendsDatas } from "../../../Interfaces/Datas-Examples"

import FriendItem from "../Items/Friend-Item";

function BlockFriends() {
    return (
        <div className="profile-block-wrapper friends-list">
            {
                friendsDatas.map((elem, index) =>
                    <FriendItem key={index} name={elem.name} profilPic={elem.profilPic} />
                )
            }
        </div>
    );
}

export default BlockFriends;