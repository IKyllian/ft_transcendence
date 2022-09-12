import { Link } from "react-router-dom";

function ResponsiveMenu(props: {show: boolean, handleClick:Function, headerModal: Function}) {
    const { show, handleClick, headerModal } = props;

    return show ? (
        <div className="responsive-menu-drawer">
            <ul>
                <li>
                    <Link to="/profile" onClick={() => handleClick()}>
                        Profile
                    </Link>
                </li>
                <li> 
                    <Link to="/chat" onClick={() => handleClick()}>
                        Message
                    </Link>
                </li>
                <li onClick={() => {headerModal(); handleClick()}}> Add friend </li>
                <li onClick={() => handleClick()}> Logout </li>
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default ResponsiveMenu;