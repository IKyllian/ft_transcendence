import { IconX } from "@tabler/icons";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { SocketContext } from "../../App";
import { useAppSelector } from "../../Redux/Hooks";
import { partyQueueString } from "../../Utils/Utils-Party";

function QueueTimer() {
    const {queueTimer, isInQueue} = useAppSelector(state => state.party);
    const {socket} = useContext(SocketContext);
    const location = useLocation();

    const cancelQueue = () => {
        socket?.emit("StopQueue");
    }

    // return isInQueue && location.pathname != "/lobby" ? ( // Don't display on lobby page
    return isInQueue ? ( // Display on lobby page
        <div className="queue-timer-wrapper">
            <div data-tooltips="Cancel" className="cancel-queue" onClick={() => cancelQueue()}>
                <IconX />
            </div>
            <p> In Queue: <span> {partyQueueString(queueTimer)} </span> </p>
        </div>
    ) : (
        <> </>
    );
}


export default QueueTimer;