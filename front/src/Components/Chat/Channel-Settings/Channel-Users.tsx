import { ChannelUser } from "../../../Types/Chat-Types";
import { IconDotsVertical } from '@tabler/icons';
import { useState } from "react";
import DropdownContainer from "../../Utils/Dropdown-Container";
import { Link } from "react-router-dom";
import BlockButton from "../../Buttons/Block-Button";
import RoleButton from "../../Buttons/Role-Button";
import ExternalImage from "../../External-Image";
import MuteButton from "../../Buttons/Mute-Button";
import BanButton from "../../Buttons/Ban-Button";
import { useAppSelector } from "../../../Redux/Hooks";

export function ChannelUserItem(props: {userDatas: ChannelUser}) {
    const { userDatas } = props;
    const {channelDatas, loggedUserIsOwner, loggedUserIsModerator} = useAppSelector((state) => state.channel);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const { currentUser } = useAppSelector(state => state.auth);

    const closeDropdown = () => {
        setShowDropdown(false);
    }

    return channelDatas ? (
        <li className="setting-user-item">
            <div className="profil-container">
                <ExternalImage src={userDatas.user.avatar} alt="User Avatar" className='profile-avatar' userId={userDatas.user.id} />
                <p> {userDatas.user.username } </p>
            </div>
            {
                currentUser?.id !== userDatas.user.id && 
                <div className="user-dropdown-container">
                    <IconDotsVertical onClick={() => setShowDropdown(!showDropdown)} />
                    <DropdownContainer show={showDropdown} onClickOutside={closeDropdown}>
                        <Link to={`/profile/${userDatas.user.username}`}>
                            <p> profile </p>
                        </Link>
                        <BlockButton
                            senderId={userDatas.user.id}
                        />
                        {
                            (loggedUserIsOwner || (loggedUserIsModerator && userDatas.role !== "owner")) &&
                            <> 
                                <RoleButton sender={userDatas} />
                                <MuteButton senderId={userDatas.user.id} chanId={channelDatas.id} usersTimeout={channelDatas.usersTimeout} />
                                <BanButton senderId={userDatas.user.id} chanId={channelDatas.id} />
                            </>
                        }
                    </DropdownContainer>
                </div>
            }
        </li>
    ) : (
        <> </>
    );
}

function ChannelUsers() {
    const { channelDatas } = useAppSelector((state) => state.channel);
    return channelDatas ? (
        <div className="user-list-container">
            <h3> Owner </h3>
            <ul>
                {
                    channelDatas.channelUsers.filter((elem) => elem.role === "owner")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} />
                    )
                }
            </ul>
            <h3> Admins </h3>
            <ul>
                {
                    channelDatas.channelUsers.filter((elem) => elem.role === "moderator")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} />
                    )
                }
            </ul>
            <h3> Users </h3>
            <ul>
                {
                    channelDatas.channelUsers.filter((elem) => elem.role === "clampin")
                    .map((elem) =>
                        <ChannelUserItem key={elem.user.id} userDatas={elem} />
                    )
                }
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default ChannelUsers;