import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
    children?: ReactNode;
    avatar: string;
    name: string;
}

function UserFindItem(props: Props) {
    const {children, avatar, name} = props;
    return (
        <div className="modal-player-list-item">
            <div className="item-player-info">
                <img className='modal-picture' src={avatar} alt="profil pic" />
                <Link to={`/profile/${name}`}>
                    {name}
                </Link>
            </div>
            {children}
        </div>
    );
}

export default UserFindItem;