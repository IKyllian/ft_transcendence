import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UserStatus } from "../../Types/User-Types";
import ExternalImage from "../External-Image";

interface Props {
    children?: ReactNode,
    avatar: string | null,
    name: string,
    status: UserStatus,
    userId: number,
}

function UserFindItem(props: Props) {
    const {children, avatar, name, status, userId} = props;

    return (
        <div className="modal-player-list-item">
            <div className="item-player-info">
                <div className="avatar-container">
                    <ExternalImage src={avatar} alt="User Avatar" className="user-avatar" userId={userId} />
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