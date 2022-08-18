import React from "react";

import HomeButton from "./Home-Button";
import Header from "../Header/Header";

function Home(props: any) {
    const {modalIsOpen, blurClass} = props
    return (
        <>
            <Header modalIsOpen={modalIsOpen} blurClass={blurClass} />
            <div className={`home-container ${blurClass}`}>
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