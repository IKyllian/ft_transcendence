import UserSidebarItem from "./User-Sidebar-Item";
import { ExampleUser } from "../../../Interfaces/Interface-User";

function UsersSidebar(props: {usersList: ExampleUser[]}) {
    const {usersList} = props;
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
                                return <UserSidebarItem key={elem.id} user={elem} />
                            else 
                                return <> </> //Temporaire
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default UsersSidebar;