import React from 'react'
import { RootState } from '../../Redux/Store'
import { useAppSelector, useAppDispatch } from '../../Redux/Hooks'
import { ModalState } from "../../Interfaces/Interface-Modal";

import { IconLogout, IconMessages, IconUserPlus } from '@tabler/icons';

import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link } from 'react-router-dom';

function Header() {
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
            {/* <header className="header" > */}
                <Link className='header-logo' to="/home">
                    pong
                </Link>
                <div className='header-right'>
                    <div className='icons-header'>
                        <IconUserPlus onClick={() => handleModalClick()} />
                        <IconMessages />
                    </div>
                    <Link className='header-profile' to="/profile">
                        <img className='header-picture' src={ProfilPic} alt="profil pic" />
                        Kyllian 
                    </Link>
                    <IconLogout />
                </div>
            </header>
        </>
    );
}

export default Header;