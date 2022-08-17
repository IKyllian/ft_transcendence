import React, { useState } from "react";

import { IconEdit, IconUserPlus, IconMessage } from '@tabler/icons';

import ProfilePic from "../../Images-Icons/pp.jpg"
import { Link } from "react-router-dom";

function CardInfo() {
    const isConnectedUser: boolean = false;
    return (
        <div className="card-info">
            <img className='profile-avatar' src={ProfilePic} alt="profil pic" />
            <div className="player-status player-status-online"> </div>
            <p> Kyllian </p>
            {
                isConnectedUser ? <IconEdit /> : 
                <>
                    <IconUserPlus className="friend-icone friend-icone-add" />
                    <Link className="send-message-icon" to="/profile">
                        <IconMessage />
                    </Link>
                    <Link className="fight-button" to="/profile">
                        Défier
                    </Link>
                     {/* <Link className="fight-button" to="/profile">
                        Watch Game
                        <IconEye />
                    </Link> */}
                </>
            }
        </div>
    );
}

export default CardInfo;