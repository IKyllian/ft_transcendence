import React from "react";

import HomeButton from "./Home-Button";
import Header from "../Header/Header";

function Home() {
    return (
        <>
            <Header />
            <div className="home-container">
                <div className="home-menu">
                    <h1> Pong Game </h1>
                    <HomeButton text={"Play"} link={"/game"} />
                    <HomeButton text={"Profile"} link={"/profile"} />
                    <HomeButton text={"Leaderboard"} link={"/leaderboard"} />
                </div>
            </div>
        </>
    );
}

export default Home;