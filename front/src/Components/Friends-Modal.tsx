import { IconX, IconUser, IconMessage, IconBrandAppleArcade } from "@tabler/icons";
import { useContext, useState } from "react";

import { ModalContext } from "./Utils/ModalProvider";
import UserFindItem from "./Search-Bar/User-Find-Item";
import SearchBarPlayers from "./Search-Bar/SearchBarPlayers";
import { friendsDatas } from "../Types/Datas-Examples";
import { fetchSearchUsersToAdd } from "../Api/User-Fetch";
import { useAppSelector } from "../Redux/Hooks";
import Avatar from "../Images-Icons/pp.jpg";

function AddFriendModal() {
    const [showFriendList, setShowFriendList] = useState<boolean>(true);

    const {friendList} = useAppSelector((state) => state.auth);
    const modalStatus = useContext(ModalContext);

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
                                friendList.map((elem, index) =>                    
                                    <UserFindItem key={index} avatar={Avatar} name={elem.username}>
                                        <div className="icons-player-item">
                                            <IconUser />
                                            <IconMessage />
                                            <IconBrandAppleArcade />
                                        </div>
                                    </UserFindItem>
                                )
                            }
                        </div> :
                        <SearchBarPlayers functionality="addFriend" fetchUserFunction={fetchSearchUsersToAdd} />
                    }
                </div>
            </div>
        </>
    ) : (
        <> </>
    );
}

export default AddFriendModal;