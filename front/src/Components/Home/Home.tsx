import { RootState } from '../../Redux/Store'
import { useAppSelector } from '../../Redux/Hooks'
import { ModalState } from "../../Interfaces/Interface-Modal";

import HomeButton from "./Home-Button";
import Header from "../Header/Header";

function Home() {
    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);

    return (
        <>
            <Header/>
            <div className={`home-container ${modalStatus.isOpen ? modalStatus.blurClass : ""}`}>
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