import { useContext } from "react";
import { IconUsers, IconX, IconPlus, IconMessage } from "@tabler/icons";
import Avatar from "../../Images-Icons/pp.jpg";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { SocketContext } from "../../App";
import { loggedUserIsLeader } from "../../Utils/Utils-Party";
import { changeModalStatus, changeSidebarChatStatus } from "../../Redux/PartySlice";

function PartyButton() {
    const { currentUser } = useAppSelector(state => state.auth);
    const { party } = useAppSelector(state => state.party);
    const { socket } = useContext(SocketContext);
    const dispatch = useAppDispatch();
    const userIsLeader: boolean = party && currentUser && loggedUserIsLeader(currentUser.id, party.players) ? true : false;

    const onCreateParty = () => {
        socket?.emit("CreateParty");
    }

    const onLeaveParty = () => {
        socket?.emit("LeaveParty");
    }

    const onKick = (id: number) => {
        socket?.emit("KickParty", {
            id: id,
        });
    }

    return party ? (
        <div className="header-party-container">
            <div className="header-party-wrapper">
                {
                    party.players.map((elem) => 
                        <div key={elem.user.id} className="fill-item">
                            { elem.isLeader &&
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" height="16" width="16" className="crown-svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5 19L3 7h2l3.5 5L12 5l3.5 7L19 7h2l-2 12H5z" fill="currentColor">
                                    </path>
                                </svg>
                            }
                            { userIsLeader && !elem.isLeader && <IconX className="party-kick" onClick={() => onKick(elem.user.id)} /> }
                            <img className="player-avatar" src={Avatar} alt="profil pic" />
                        </div>
                    )
                }
                {
                    Array.from({length: 4 - party.players.length}, (elem, index) => 
                        <div key={index} className="party-item">
                            <IconPlus onClick={() => dispatch(changeModalStatus(true))} />
                        </div>
                    )
                }
                <div className="party-separtor"> </div>
                <div className="party-item"> <IconMessage onClick={() => dispatch(changeSidebarChatStatus())} /> </div>
                <div className="party-item" onClick={() => onLeaveParty()}> <IconX /> </div>
            </div>
        </div>
    ) : (
        <button className="party-button" onClick={() => onCreateParty()}> <IconUsers /> create party </button>
    );
}

export default PartyButton;