import { useContext, useState } from "react";
import { IconUsers, IconSettings, IconX, IconPlus, IconCrown } from "@tabler/icons";
import Avatar from "../../Images-Icons/pp.jpg";
import { UserInterface } from "../../Types/User-Types";
import { useAppSelector } from "../../Redux/Hooks";
import { Link } from "react-router-dom";
import { SocketContext } from "../../App";

function PartyButton() {
    const {currentUser} = useAppSelector(state => state.auth);
    const [partyCreated, setPartyCreated] = useState<boolean>(false);
    const [usersparty, setUsersParty] = useState<UserInterface[]>([currentUser!]);

    const { party } = useAppSelector(state => state.party);
    const { socket } = useContext(SocketContext);

    const onCreateParty = () => {
        socket?.emit("CreateParty");
    }

    const onLeaveParty = () => {
        socket?.emit("LeaveParty");
    }

    return party ? (
        <div className="header-party-container">
            <div className="header-party-wrapper">
                {
                    party.players.map((elem, index) => 
                        <div key={elem.user.id} className="fill-item">
                            { elem.isLeader &&
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" height="16" width="16" className="crown-svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5 19L3 7h2l3.5 5L12 5l3.5 7L19 7h2l-2 12H5z" fill="currentColor">
                                    </path>
                                </svg>
                            }
                            <img className="player-avatar" src={Avatar} alt="profil pic" />
                        </div>
                    )
                }
                {
                    Array.from({length: 4 - party.players.length}, (elem, index) => 
                        <div key={index} className="party-item">
                            <IconPlus />
                        </div>
                    )
                }
                <div className="party-separtor"> </div>
                <Link to="/lobby">
                    <div className="party-item"> <IconSettings /> </div>
                </Link>
                <div className="party-item" onClick={() => onLeaveParty()}> <IconX /> </div>
            </div>
        </div>
    ) : (
        <button className="party-button" onClick={() => onCreateParty()}> <IconUsers /> create party </button>
    );
}

export default PartyButton;