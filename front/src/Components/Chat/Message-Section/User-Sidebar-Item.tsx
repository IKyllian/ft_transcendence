import ProfilPic from "../../../Images-Icons/pp.jpg";
import { ExampleUser } from "../../../Interfaces/Interface-User";

function UserSidebarItem(props: {user: ExampleUser}) {
    const {user} = props;
    return (
        <li>
            <div className="avatar-container">
                <img className='user-avatar' src={ProfilPic} alt="profil pic" />
                <div className="user-status">
                    <div className={`${user.isOnline ? "online" :"offline"}`}> </div>
                </div>
            </div>
            { user.name }
        </li>
    );
}

export default UserSidebarItem;