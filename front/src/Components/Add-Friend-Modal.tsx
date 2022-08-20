import React, { useEffect, useState } from "react";
import {IconSearch, IconX} from "@tabler/icons";
import { RootState } from '../Redux/Store'
import { useAppDispatch, useAppSelector } from '../Redux/Hooks'
import { ModalState } from "../Interfaces/Interface-Modal";
import {playerDatas} from "../Interfaces/Datas-Examples"

import ProfilPic from "../Images-Icons/pp.jpg";

function AddFriendModal() {
    const [inputText, setInputText] = useState<string>("");
    const [arrayResult, setArrayResult] = useState<string[]>([]);


    const modalStatus: ModalState =  useAppSelector((state: RootState) => state.modal);
    const dispatch = useAppDispatch();

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    const exitModal = () => {
        dispatch({
            type: "modal/changeStatus",
        })
    }

    useEffect(() => {
        if (inputText.length > 0) {
            let newArray: string[] = [];

            newArray = playerDatas.filter(elem => ((elem.toLowerCase().includes(inputText.toLowerCase())) === true));
            setArrayResult(newArray);
        } else {
            setArrayResult([]);
        }
    }, [inputText])

    if (modalStatus.isOpen) {
        return (
            <>
                <div className="modal-wrapper-container">
                    <div className="add-friend-modal-wrapper">
                        <IconX className="modal-exit" onClick={() => exitModal()} />
                        <div className='add-friend-modal'>
                            <div className="modal-search">
                                <IconSearch />
                                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => handleChange(e)} />
                            </div>
                            <div className="modal-player-list">
                                {
                                    arrayResult.map((elem, index) =>
                                        <div key={index} className="modal-player-list-item">
                                            <div className="item-player-info">
                                                <img className='modal-picture' src={ProfilPic} alt="profil pic" />
                                                <p> {elem} </p>
                                            </div>
                                            <a> Add friend </a>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
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