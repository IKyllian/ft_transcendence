import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { stopShowGameFound, unsetGameFound } from "../../Redux/PartySlice";
import { GameType } from "../../Types/Lobby-Types";

function MatchFound() {
    const { gameFound } = useAppSelector(state => state.party);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (gameFound && gameFound.showGameFound) {
            setTimeoutId(setTimeout(() => {
                dispatch(unsetGameFound());
            }, 15000))
        }
    }, [gameFound?.showGameFound]);

    const handleClick = () => {
        if (gameFound) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(undefined);
            }
            dispatch(stopShowGameFound());
            navigate("/game", {state: gameFound.gameDatas});
        }
    }

    const displayGameMode = (game_type: GameType, isRanked: boolean) => {
        if (!isRanked)
            return "Custom Game";
        if (game_type === GameType.Singles)
            return "Ranked 1v1";
        return "Ranked 2v2";
    }

    return gameFound && gameFound.showGameFound ? (
        <div className="match-found-container">
            <div className="outside-circle">
            </div>
            <div className="fill-match-found">
                <div>
                    <p className="found-title"> Game Found </p>
                    <p> {displayGameMode(gameFound.gameDatas.game_settings.game_type, gameFound.gameDatas.game_settings.is_ranked)} Ranked 1v1 </p>
                </div>
                <button className="accept-button" onClick={() => handleClick()}> Accept </button>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default MatchFound;