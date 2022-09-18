import { Link } from "react-router-dom";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { ExampleUser } from "../../../Types/User-Types";

function UserSidebarItem(props: {user: ExampleUser}) {
    const { user } = props;
    return (
        <li>
            <div className="avatar-container">
                <img className='user-avatar' src={ProfilPic} alt="profil pic" />
                <div className="user-status">
                    <div className={`${user.isOnline ? "online" :"offline"}`}> </div>
                </div>
            </div>
            <Link to="/profile">
                { user.username }
            </Link>
        </li>
    );
}

export default UserSidebarItem;