import { friendsDatas } from "../../../Types/Datas-Examples"
import { UserInterface } from "../../../Types/User-Types";

import FriendItem from "../Items/Friend-Item";

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