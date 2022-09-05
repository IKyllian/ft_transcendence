import { IconX } from "@tabler/icons";
import SearchBarPlayers from "./SearchBarPlayers";
import { useContext } from "react";

import { ModalContext } from "./ModalProvider";

function AddFriendModal() {
    const modalStatus = useContext(ModalContext);

    if (modalStatus.modal.isOpen) {
        return (
            <>
                <div className="modal-wrapper-container">
                    <div className="add-friend-modal-wrapper">
                        <IconX className="modal-exit" onClick={() => modalStatus.setStatus()} />
                        <SearchBarPlayers functionality="addFriend" />
                    </div>
                </div>
            </>
        );
    } else {
        return(
            <> </>
        );
    }    
}

export default AddFriendModal;