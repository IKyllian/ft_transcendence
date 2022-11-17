import { useState, useContext, useEffect } from 'react';
import { IconLogout, IconMessages, IconUserPlus, IconChevronDown, IconBell } from '@tabler/icons';

import { ModalContext } from '../Utils/ModalProvider';
import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/Hooks';
import DropdownNotification from './Dropdown-Notification';
import ResponsiveMenu from './Responsive-Menu';
import PartyButton from './Party-Button';
import { NotificationInterface, notificationType } from '../../Types/Notification-Types';
import { logoutSuccess } from '../../Redux/AuthSlice';
import { fetchLogout } from '../../Api/Sign/Sign-Fetch';

function NotifIcon(props: {notifications: NotificationInterface[] | undefined ,handleNotifDropdownClick: Function}) {
    const {handleNotifDropdownClick, notifications} = props;
    return (
        <div className='badge-wrapper'>
            { notifications !== undefined
            && notifications.filter(elem => elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PARTY_INVITE  && elem.type !== notificationType.PRIVATE_MESSAGE).length > 0
            && <div className='badge badge-notif'> {notifications.filter(elem => elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PARTY_INVITE && elem.type !== notificationType.PRIVATE_MESSAGE).length} </div> }
            <IconBell onClick={() => handleNotifDropdownClick()} />
        </div>
    );
}

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
    const location = useLocation();
    const { currentUser, token } = useAppSelector(state => state.auth);
    const {notifications} = useAppSelector(state => state.notification);
    const modalStatus = useContext(ModalContext);
    const dispatch = useAppDispatch();

    console.log("notifications", notifications);

    const handleMenuClick = () => {
        if (showNotifDropdown && !showMenu)
            setShowNotifDropdown(false);
        setShowMenu(!showMenu);
    }

    const handleNotifDropdownClick = () => {
        if (showMenu && !showNotifDropdown)
            setShowMenu(false);
        setShowNotifDropdown(!showNotifDropdown);
    }

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        fetchLogout(token);
        console.log("TEst");
        dispatch(logoutSuccess());
        console.log("TEst2");
    }

    useEffect(() => {
        if (showMenu)
            setShowMenu(false);
        if (showNotifDropdown)
            setShowNotifDropdown(false);
    }, [location.pathname])

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
                    <PartyButton />
                    <NotifIcon notifications={notifications} handleNotifDropdownClick={handleNotifDropdownClick} />
                    <IconUserPlus onClick={() => modalStatus.setStatus()} />
                    <Link to="/chat" aria-label="Link to the chat">
                        <div className='badge-wrapper'>
                            { notifications !== undefined && notifications.filter(elem => elem.type === notificationType.CHANNEL_MESSAGE || elem.type === notificationType.PRIVATE_MESSAGE).length > 0 && <div className='badge badge-message'> </div> }
                            <IconMessages />
                        </div>
                    </Link>
                </div>
                <Link className='header-profile' to={`/profile/${currentUser?.username}`}>
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    {currentUser?.username}
                </Link>
                <IconLogout onClick={() => handleLogout()} />
            </div>
            <div className='header-right-responsive'>
                <NotifIcon notifications={notifications} handleNotifDropdownClick={handleNotifDropdownClick} />
                <img className='header-picture' src={ProfilPic} alt="profil pic" />
                <IconChevronDown style={{cursor: "pointer"}} onClick={() => handleMenuClick()} />
                <ResponsiveMenu show={showMenu} handleClick={handleMenuClick} headerModal={modalStatus.setStatus} />
            </div>
        </header>
    );
    
}

export default Header;