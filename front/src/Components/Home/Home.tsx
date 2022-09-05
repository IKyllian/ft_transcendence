import { useContext } from "react";

import { ModalContext } from "../ModalProvider";
import HomeButton from "./Home-Button";
import Header from "../Header/Header";

function Home() {
    const modalStatus = useContext(ModalContext);

    return (
        <>
            <Header/>
            <div className={`home-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
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