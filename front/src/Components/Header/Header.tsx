import { useState, useContext } from 'react';
import { IconLogout, IconMessages, IconUserPlus, IconChevronDown } from '@tabler/icons';

import { ModalContext } from '../ModalProvider';
import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link } from 'react-router-dom';

import ResponsiveMenu from './Responsive-Menu';

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const modalStatus = useContext(ModalContext);

    return (
        <header className={`header ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`} >
            <Link className='header-logo' to="/home">
                pong
            </Link>
            <div className='header-right'>
                <div className='icons-header'>
                    <IconUserPlus onClick={() => modalStatus.setStatus()} />
                    <Link to="/chat">
                        <IconMessages />
                    </Link>
                </div>
                <Link className='header-profile' to="/profile">
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    Kyllian 
                </Link>
                <IconLogout />
            </div>
            <div className='header-right-responsive'>
                    <img className='header-picture' src={ProfilPic} alt="profil pic" />
                    <IconChevronDown onClick={() => setShowMenu(!showMenu)} />
                    <ResponsiveMenu show={showMenu} headerModal={modalStatus.setStatus} />
                </div>
        </header>
    );
}

export default Header;