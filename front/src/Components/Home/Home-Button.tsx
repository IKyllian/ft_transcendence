import React from 'react'
import { Link } from 'react-router-dom';

function HomeButton(props: any) {
    const {text, link} = props;
    
    return (
        <Link to={link} className='home-button'>
            {text}
        </Link> 
    );
}

export default HomeButton;