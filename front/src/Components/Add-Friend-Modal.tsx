import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons";
import { RootState } from '../Redux/Store'
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { ModalState } from "../Interfaces/Interface-Modal";
import SearchPlayerInput from "./SearchPlayerInput";

function AddFriendModal() {
    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);
    const dispatch = useAppDispatch();

    const exitModal = () => {
        dispatch({
            type: "modal/changeStatus",
        })
    }

    if (modalStatus.isOpen) {
        return (
            <>
                <div className="modal-wrapper-container">
                    <div className="add-friend-modal-wrapper">
                        <IconX className="modal-exit" onClick={() => exitModal()} />
                        <SearchPlayerInput />
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