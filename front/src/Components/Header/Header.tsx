import { useState } from 'react';
import { RootState } from '../../Redux/Store'
import { useAppSelector, useAppDispatch } from '../../Redux/Hooks'
import { ModalState } from "../../Interfaces/Interface-Modal";

import { IconLogout, IconMessages, IconUserPlus, IconChevronDown } from '@tabler/icons';

import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link } from 'react-router-dom';

import ResponsiveMenu from './Responsive-Menu';

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);
    const dispatch = useAppDispatch();

    const handleModalClick = () => {
        dispatch({
            type: "modal/changeStatus",
        })
    }
    return (
        <>
            <header className={`header ${modalStatus.isOpen ? modalStatus.blurClass: ""}`} >
                <Link className='header-logo' to="/home">
                    pong
                </Link>
                <div className='header-right'>
                    <div className='icons-header'>
                        <IconUserPlus onClick={() => handleModalClick()} />
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
                        <ResponsiveMenu show={showMenu} headerModal={handleModalClick} />
                    </div>
            </header>
        </>
    );
}

export default Header;