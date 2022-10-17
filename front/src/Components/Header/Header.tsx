import { useState, useContext } from 'react';
import { IconLogout, IconMessages, IconUserPlus, IconChevronDown, IconBell } from '@tabler/icons';

import { ModalContext } from '../Utils/ModalProvider';
import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../Redux/Hooks';
import DropdownNotification from './Dropdown-Notification';

import ResponsiveMenu from './Responsive-Menu';

function NotifIcon(props: {setShowNotifDropdown: Function}) {
    const {setShowNotifDropdown} = props;
    const {notifications} = useAppSelector(state => state.notification);
    return (
        <div className='badge-wrapper'>
            { notifications !== undefined && notifications.length > 0 && <div className='badge-notif'> {notifications?.length} </div> }
            <IconBell onClick={() => setShowNotifDropdown((state: boolean) => !state)} />
        </div>
    );
}

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
    const location = useLocation();
    const { currentUser } = useAppSelector(state => state.auth);
    const modalStatus = useContext(ModalContext);

    const handleClick = () => {
        setShowMenu(!showMenu);
    }

    return location.pathname === "/sign" || location.pathname === "/set-username" ? (
        <> </>
    ) : (
        <header className={`header ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`} >
            { showNotifDropdown && <DropdownNotification />}
            <Link className='header-logo' to="/">
                pong
            </Link>
            <div className='header-right'>
                <div className='icons-header'>
                    <NotifIcon setShowNotifDropdown={setShowNotifDropdown} />
                    <IconUserPlus onClick={() => modalStatus.setStatus()} />
                    <Link to="/chat">
                        <IconMessages />
                    </Link>
                </div>
                <Link className='header-profile' to={`/profile/${currentUser?.username}`}>
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    {currentUser?.username}
                </Link>
                <IconLogout />
            </div>
            <div className='header-right-responsive'>
                    <NotifIcon setShowNotifDropdown={setShowNotifDropdown} />
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    <IconChevronDown onClick={() => setShowMenu(!showMenu)} />
                    <ResponsiveMenu show={showMenu} handleClick={handleClick} headerModal={modalStatus.setStatus} />
                </div>
        </header>
    );
    
}

export default Header;