import { useContext } from "react";
import { Link } from "react-router-dom";
import { SocketContext } from "../../App";
import { logoutSuccess } from "../../Redux/AuthSlice";
import { useAppDispatch } from "../../Redux/Hooks";

function ResponsiveMenu(props: {show: boolean, handleClick:Function, headerModal: Function, username: string}) {
    const { show, handleClick, headerModal, username } = props;
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        socket?.emit("Logout");
        dispatch(logoutSuccess());
    }

    return show ? (
        <div className="responsive-menu-drawer">
            <ul>
                <li>
                    <Link to={`/profile/${username}`} onClick={() => handleClick()}>
                        Profile
                    </Link>
                </li>
                <li> 
                    <Link to="/chat" onClick={() => handleClick()}>
                        Message
                    </Link>
                </li>
                <li onClick={() => { headerModal(); handleClick() }}> Friends / Users </li>
                <li onClick={() => { handleClick(); handleLogout() }}> Logout </li>
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default ResponsiveMenu;