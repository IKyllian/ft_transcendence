import { Link } from "react-router-dom";

function ResponsiveMenu(props: {show: boolean, headerModal: Function}) {
    const { show, headerModal } = props;

    return show ? (
        <div className="responsive-menu-drawer">
            <ul>
                <li>
                    <Link to="/profile">
                        Profile
                    </Link>
                </li>
                <li> 
                    <Link to="/chat">
                        Message
                    </Link>
                </li>
                <li onClick={() => headerModal()}> Add friend </li>
                <li> Logout </li>
            </ul>
        </div>
    ) : (
        <> </>
    );
}

export default ResponsiveMenu;