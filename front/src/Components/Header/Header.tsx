import React from 'react'

import { IconLogout, IconMessages, IconUserPlus } from '@tabler/icons';

import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link } from 'react-router-dom';

import AddFriendModal from '../Add-Friend-Modal';

function Header() {
    return (
        <>
            <header className='header'>
                <Link className='header-logo' to="/home">
                    pong
                </Link>
                <div className='header-right'>
                    <div className='icons-header'>
                        <IconUserPlus />
                        <IconMessages />
                    </div>
                    <Link className='header-profile' to="/profile">
                        <img className='header-picture' src={ProfilPic} alt="profil pic" />
                        Kyllian 
                    </Link>
                    <IconLogout />
                </div>
            </header>
            {/* <AddFriendModal /> */}
        </>
    );
}

export default Header;