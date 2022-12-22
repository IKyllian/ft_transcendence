import { IconX, IconMessage, IconEye, IconUserX, IconDeviceGamepad2, IconChevronsDownLeft } from "@tabler/icons";
import { useContext, useEffect, useState } from "react";

import { ModalContext } from "./Utils/ModalProvider";
import UserFindItem from "./Search-Bar/User-Find-Item";
import SearchBarPlayers from "./Search-Bar/SearchBarPlayers";
import { fetchSearchUsersToAdd } from "../Api/User-Fetch";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { SearchBarFunctionality } from "../Types/Utils-Types";
import { SocketContext } from "../App";
import { UserStatus } from "../Types/User-Types";
import { changeFriendListUserStatus } from "../Redux/AuthSlice";
import { Link } from "react-router-dom";
import { useFriendHook } from "../Hooks/Friend-Hook";

function AddFriendModal() {
    const [showFriendList, setShowFriendList] = useState<boolean>(true);

    const {friendList} = useAppSelector((state) => state.auth);
    const {party} = useAppSelector(state => state.party);
    const {handleRemoveFriend} = useFriendHook();
    const modalStatus = useContext(ModalContext);
    const {socket} = useContext(SocketContext);
    const dispatch = useAppDispatch();

    useEffect(() => {
        socket?.on("StatusUpdate", (data: {id: number, status: UserStatus}) => {
            dispatch(changeFriendListUserStatus(data));
        });

        return () => {
            socket?.off("StatusUpdate");
        }
    }, [socket]);

    const spectateClick = (gameId: string) => {
        if (gameId)
            socket?.emit("get_gameinfo", gameId);
    }

    return modalStatus.modal.isOpen ? (
        <>
            <div className="modal-wrapper-container">
                <div className="add-friend-modal-wrapper">
                    <IconX className="modal-exit" onClick={() => modalStatus.setStatus()} />
                    <div className="modal-header">
                        <div>
                            <p className={`${showFriendList ? "modal-header-selected" : ""}`} onClick={() => setShowFriendList(true)}> Friend List </p>
                        </div>
                        <div>
                            <p className={`${!showFriendList ? "modal-header-selected" : ""}`} onClick={() => setShowFriendList(false)}> Add Friends </p>
                        </div>
                    </div>
                    {
                        showFriendList ?
                        <div className="modal-player-list modal-friend-list">
                            {
                                friendList.length > 0 && friendList.map((elem, index) =>                    
                                    <UserFindItem key={index} avatar={elem.avatar} name={elem.username} status={elem.status} userId={elem.id} >
                                        <div className="icons-player-item">
                                            { elem.in_game_id !== null && <IconEye onClick={() => spectateClick(elem.in_game_id!)} className='spectate-icon' /> }
                                            { (!party || (party && !party.players.find(partyUser => partyUser.user.id === elem.id))) && <IconDeviceGamepad2 onClick={() => socket?.emit("PartyInvite", {id: elem.id})} />}
                                            <Link className="send-message-icon" to="/chat" state={{userIdToSend: elem.id}}>
                                                <IconMessage />
                                            </Link>
                                            <IconUserX onClick={() => handleRemoveFriend(elem.id)} />
                                        </div>
                                    </UserFindItem>
                                )
                            }

                            {
                                friendList.length === 0 &&
                                <p> No friend yet </p>
                            }
                        </div> :
                        <SearchBarPlayers functionality={SearchBarFunctionality.ADD_FRIEND} fetchUserFunction={fetchSearchUsersToAdd} />
                    }
                </div>
            </div>
        </>
    ) : (
        <> </>
    );
}

export default AddFriendModal;