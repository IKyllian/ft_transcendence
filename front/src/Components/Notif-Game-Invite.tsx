import { useContext } from "react";
import Avatar from "../Images-Icons/pp.jpg";
import { SocketContext } from "../App";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { removePartyInvite } from "../Redux/PartySlice";
import ExternalImage from "./External-Image";

function NotifGameInvite() {
    const { partyInvite } = useAppSelector(state => state.party);
    const dispatch = useAppDispatch();
    const { socket } = useContext(SocketContext);

    const handleAccept = (notifId: number, requesterId: number) => {
        socket!.emit("JoinParty", { id: requesterId });
        dispatch(removePartyInvite(notifId));
    }

    const handleDecline = (notifId: number) => {
        dispatch(removePartyInvite(notifId));
    }

    return partyInvite.length > 0 ? (
        <div className="game-invite-container">
            {
                partyInvite.map((elem) => 
                    <div key={elem.id} className="game-invite-wrapper">
                        <div className="notif-top">
                        <ExternalImage src={elem.requester.avatar} alt="User Avatar" className='profile-avatar' userId={elem.requester.id} />
                            <div className="notif-text">
                                <p> {elem.requester.username} </p>
                                <p> Invited you to play a game </p>
                            </div>
                        </div>
                        <div className="separate-line"></div>
                        <div className="notif-bottom">
                            <button onClick={() => handleAccept(elem.id, elem.requester.id)}> Accept </button>
                            <button onClick={() => handleDecline(elem.id)}> Decline </button>
                        </div>
                    </div>
                )
            }
        </div>
    ) : (
        <> </>
    );
}

export default NotifGameInvite;