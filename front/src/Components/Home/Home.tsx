import React from "react";

import HomeButton from "./Home-Button";
import Header from "../Header/Header";

function Home() {
    return (
        <div className="home-container">
            <Header />
            <div className="home-menu">
                <h1> Pong Game </h1>
                <HomeButton text={"Play"} link={"/game"} />
                <HomeButton text={"Profile"} link={"/profil"} />
                <HomeButton text={"Leaderboard"} link={"/leaderboard"} />
            </div>
        </div>
    );
}

export default Home;