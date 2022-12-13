import { IconX, IconUser, IconMessage, IconBrandAppleArcade } from "@tabler/icons";
import { useContext, useEffect, useState } from "react";

import { ModalContext } from "./Utils/ModalProvider";
import UserFindItem from "./Search-Bar/User-Find-Item";
import SearchBarPlayers from "./Search-Bar/SearchBarPlayers";
import { fetchSearchUsersToAdd } from "../Api/User-Fetch";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import Avatar from "../Images-Icons/pp.jpg";
import { SearchBarFunctionality } from "../Types/Utils-Types";
import { SocketContext } from "../App";
import { UserStatus } from "../Types/User-Types";
import { changeFriendListUserStatus } from "../Redux/AuthSlice";

function AddFriendModal() {
    const [showFriendList, setShowFriendList] = useState<boolean>(true);

    const {friendList} = useAppSelector((state) => state.auth);
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
                                            <IconUser />
                                            <IconMessage />
                                            <IconBrandAppleArcade />
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