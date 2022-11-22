import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UserStatus } from "../../Types/User-Types";

interface Props {
    children?: ReactNode;
    avatar: string;
    name: string;
    status: UserStatus
}

function UserFindItem(props: Props) {
    const {children, avatar, name, status} = props;
    return (
        <div className="modal-player-list-item">
            <div className="item-player-info">
                <div className="avatar-container">
                    <img className='user-avatar' src={avatar} alt="profil pic" />
                    <div className="user-status">
                        <div className={`${status === UserStatus.ONLINE ? "online" : "offline"}`}> </div>
                    </div>
                </div>
                <Link to={`/profile/${name}`}>
                    {name}
                </Link>
            </div>
            {children}
        </div>
    );
}

export default UserFindItem;