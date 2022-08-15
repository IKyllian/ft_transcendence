import React from 'react'

import { IconLogout, IconMessages } from '@tabler/icons';

import ProfilPic from "../../Images-Icons/pp.jpg"
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className='header'>
            <Link to="/home">
                pong
            </Link>
            <div className='header-right'>
                <IconMessages />
                <img className='header-picture' src={ProfilPic} alt="profil pic" />
                <p> Kyllian </p>
                <IconLogout />
            </div>
            
        </header>
    );
}

export default Header;