import { useState, useContext } from 'react';
import { IconLogout, IconMessages, IconUserPlus, IconChevronDown } from '@tabler/icons';

import { ModalContext } from '../Utils/ModalProvider';
import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../Redux/Hooks';

import ResponsiveMenu from './Responsive-Menu';

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    let location = useLocation();
    let { currentUser } = useAppSelector(state => state.auth);

    const modalStatus = useContext(ModalContext);

    const handleClick = () => {
        setShowMenu(!showMenu);
    }

    return location.pathname === "/sign" || location.pathname === "/set-username" ? (
        <> </>
    ) : (
        <header className={`header ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`} >
            <Link className='header-logo' to="/">
                pong
            </Link>
            <div className='header-right'>
                <div className='icons-header'>
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
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    <IconChevronDown onClick={() => setShowMenu(!showMenu)} />
                    <ResponsiveMenu show={showMenu} handleClick={handleClick} headerModal={modalStatus.setStatus} />
                </div>
        </header>
    );
    
}

export default Header;