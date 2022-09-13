import { IconX } from "@tabler/icons";
import SearchBarPlayers from "./SearchBarPlayers";
import { useContext } from "react";

import { ModalContext } from "./ModalProvider";

function AddFriendModal() {
    const modalStatus = useContext(ModalContext);

    return modalStatus.modal.isOpen ? (
        <>
            <div className="modal-wrapper-container">
                <div className="add-friend-modal-wrapper">
                    <IconX className="modal-exit" onClick={() => modalStatus.setStatus()} />
                    <SearchBarPlayers functionality="addFriend" />
                </div>
            </div>
        </>
    ) : (
        <> </>
    );
}

export default AddFriendModal;