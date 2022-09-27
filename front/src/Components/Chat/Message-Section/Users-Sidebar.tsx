import { Link } from "react-router-dom";
import ProfilPic from "../../../Images-Icons/pp.jpg";
import { ExampleUser } from "../../../Types/User-Types";
import { ChannelUser } from "../../../Types/Chat-Types";

function UserSidebarItem(props: {user: ChannelUser}) {
    const { user } = props;
    return (
        <li>
            <div className="avatar-container">
                <img className='user-avatar' src={ProfilPic} alt="profil pic" />
                <div className="user-status">
                    <div className="online"> </div>
                    {/* <div className={`${user.isOnline ? "online" :"offline"}`}> </div> */}
                </div>
            </div>
            <Link to="/profile">
                { user.user.username }
            </Link>
        </li>
    );
}

function UsersSidebar(props: {usersList: ChannelUser[]}) {
    const { usersList } = props;
    return (
        <div className="users-sidebar">
            <div className="users-sidebar-wrapper">
                <h3> Administrators - 1 </h3>
                <ul>
                    <UserSidebarItem user={usersList[0]}  />
                </ul>
                <h3> Users - {usersList.length - 1} </h3>
                <ul>
                    {
                        usersList.map((elem, index) => {
                            if (index > 0)
                                return <UserSidebarItem key={elem.user.id} user={elem} />
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default UsersSidebar;