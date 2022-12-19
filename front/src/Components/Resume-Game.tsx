import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { SocketContext } from "../App";
import { useAppSelector } from "../Redux/Hooks";

function ResumeGame() {
    const {currentUser} = useAppSelector(state => state.auth);
    const {socket} = useContext(SocketContext);
    const location = useLocation();

    return currentUser && currentUser.in_game_id && location.pathname !== "/game" ? (
        <div className="resume-game-container">
            <p> You are currently in game. </p>
            <button onClick={() => socket?.emit("get_gameinfo", currentUser.in_game_id)}> Resume game </button>
        </div>
    ) : (
        <> </>
    );
}

export default ResumeGame;