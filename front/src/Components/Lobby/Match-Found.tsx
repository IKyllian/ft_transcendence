import { IconX } from "@tabler/icons";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { stopShowGameFound, unsetGameFound } from "../../Redux/PartySlice";

function MatchFound() {
    const { gameFound } = useAppSelector(state => state.party);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            dispatch(unsetGameFound());
        }, 10000)
    }, []);

    const handleClick = () => {
        if (gameFound) {
            dispatch(stopShowGameFound());
            navigate("/game", {state: gameFound.gameDatas});
        }
    }

    return gameFound && gameFound.showGameFound ? (
        <div className="match-found-container">
            <div className="outside-circle">
                {/* <IconX className="decline-button" /> */}
            </div>
            <div className="fill-match-found">
                <div>
                    <p className="found-title"> Game Found </p>
                    <p> Ranked 1v1 </p>
                </div>
                <button className="accept-button" onClick={() => handleClick()}> Accept </button>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default MatchFound;