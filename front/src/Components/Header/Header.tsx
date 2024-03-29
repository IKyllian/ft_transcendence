import { useState, useContext, useEffect } from 'react';
import { IconLogout, IconMessages, IconUsers, IconChevronDown, IconBell } from '@tabler/icons';

import { ModalContext } from '../Utils/ModalProvider';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../Redux/Hooks';
import DropdownNotification from './Dropdown-Notification';
import ResponsiveMenu from './Responsive-Menu';
import PartyButton from './Party-Button';
import { NotificationInterface, notificationType } from '../../Types/Notification-Types';
import { SocketContext } from '../../App';
import ExternalImage from '../External-Image';
import QueueTimer from './Queue-Timer';

function NotifIcon(props: {notifications: NotificationInterface[] | undefined ,handleNotifDropdownClick: Function}) {
    const {handleNotifDropdownClick, notifications} = props;
    return (
        <div className='badge-wrapper' onClick={() => handleNotifDropdownClick()}>
            { notifications !== undefined
            && notifications.filter(elem => elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PARTY_INVITE  && elem.type !== notificationType.PRIVATE_MESSAGE).length > 0
            && <div className='badge badge-notif'> {notifications.filter(elem => elem.type !== notificationType.CHANNEL_MESSAGE && elem.type !== notificationType.PARTY_INVITE && elem.type !== notificationType.PRIVATE_MESSAGE).length} </div> }
            <IconBell />
        </div>
    );
}

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
    const location = useLocation();
    const { currentUser } = useAppSelector(state => state.auth);
    const {notifications} = useAppSelector(state => state.notification);
    const modalStatus = useContext(ModalContext);
    const {socket} = useContext(SocketContext);

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
        socket?.emit("Logout");
    }

    useEffect(() => {
        if (showMenu)
            setShowMenu(false);
        if (showNotifDropdown)
            setShowNotifDropdown(false);
    }, [location.pathname])

    return !currentUser || location.pathname === "/sign" || location.pathname === "/set-username" ? (
        <> </>
    ) : (
        <header className={`header ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`} >
            { showNotifDropdown && <DropdownNotification />}
            <Link className='header-logo' to="/">
                pong
            </Link>
            <div className='header-right'>
                <div className='icons-header'>
                    <QueueTimer />
                    <PartyButton />
                    <div data-tooltips="Notifications">
                        <NotifIcon notifications={notifications} handleNotifDropdownClick={handleNotifDropdownClick}   />
                    </div>
                    <div data-tooltips="Social" className="tooltip-icon-wrapper">
                        <IconUsers onClick={() => modalStatus.setStatus()} />
                    </div>
                    <Link to="/chat" aria-label="Link to the chat" >
                        <div data-tooltips="Chat" className='badge-wrapper'>
                            {
                                notifications !== undefined
                                && notifications.filter(elem => elem.type === notificationType.CHANNEL_MESSAGE || elem.type === notificationType.PRIVATE_MESSAGE).length > 0
                                && <div className='badge badge-message'> </div>
                            }
                            <IconMessages />
                        </div>
                    </Link>
                </div>
                <Link className='header-profile' to={`/profile/${currentUser.username}`}>
                    <ExternalImage src={currentUser.avatar} alt="User Avatar" className="header-avatar" userId={currentUser.id} />
                    {currentUser.username}
                </Link>
                <div className="tooltip-icon-wrapper" data-tooltips="Logout" >
                    <IconLogout onClick={() => handleLogout()} />
                </div>
            </div>
            <div className='header-right-responsive'>
                <PartyButton />
                <NotifIcon notifications={notifications} handleNotifDropdownClick={handleNotifDropdownClick} />
                <ExternalImage src={currentUser.avatar} alt="User Avatar" className="header-avatar" userId={currentUser.id} />
                <IconChevronDown style={{cursor: "pointer"}} onClick={() => handleMenuClick()} />
                <ResponsiveMenu show={showMenu} handleClick={handleMenuClick} headerModal={modalStatus.setStatus} username={currentUser.username} />
            </div>
        </header>
    );
    
}

export default Header;