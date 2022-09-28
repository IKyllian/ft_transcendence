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
                <h3> Administrators - {usersList.filter((elem) => elem.role === "owner").length} </h3>
                <ul>
                    {
                        usersList.map((elem) =>  {
                            if (elem.role === "owner")
                                return <UserSidebarItem key={elem.user.id} user={elem}  />
                        })
                    }
                </ul>
                <h3> Users - {usersList.filter((elem) => elem.role === "clampin").length} </h3>
                <ul>
                    {
                        usersList.map((elem) => {
                            if (elem.role === "clampin")
                                return <UserSidebarItem key={elem.user.id} user={elem} />
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default UsersSidebar;