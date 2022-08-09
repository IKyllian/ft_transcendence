import React from "react";
import { Link } from 'react-router-dom'

function Sign() {
    return (
        <div className="sign-container">
            <h3> Pour pouvoir acceder au site vous devez être student 42 </h3>
            <Link to="/home">
                Se connecter
            </Link>
        </div>
    );
}

export default Sign;