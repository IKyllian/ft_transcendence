import { useContext } from "react";

import { ModalContext } from "../Utils/ModalProvider";
import { useAppSelector } from '../../Redux/Hooks';
import HomeButton from "./Home-Button";

function Home() {
    const modalStatus = useContext(ModalContext);

    let {currentUser} = useAppSelector(state => state.auth);

    return (
        <div className={`home-container ${modalStatus.modal.isOpen ? modalStatus.modal.blurClass : ""}`}>
            <div className="home-menu">
                <h1> Pong Game </h1>
                <HomeButton text={"Play"} link={"/game"} />
                <HomeButton text={"Profile"} link={`/profile/${currentUser?.username}`} />
                <HomeButton text={"Leaderboard"} link={"/leaderboard"} />
            </div>
        </div>
    );
}

export default Home;