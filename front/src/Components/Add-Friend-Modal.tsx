import React, { useEffect, useState } from "react";
import {IconSearch, IconX} from "@tabler/icons";

import ProfilPic from "../Images-Icons/pp.jpg";

const playerDatas: string[] = [
    "Johan",
    "Karim",
    "Jojo",
    "Loic",
    "Chafik",
    "Arsene",
    "Lucas",
]

function AddFriendModal(props: any) {
    const {modalIsOpen} = props;
    const [inputText, setInputText] = useState<string>("");
    const [arrayResult, setArrayResult] = useState<string[]>(playerDatas);

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    // useEffect(() => {
    //     let newArray: string[] = [];

    //     console.log(playerDatas[0].search(inputText))
    //     console.log(playerDatas.filter(elem => ((elem.includes(inputText)) === true)));
    //     setArrayResult(newArray);
    // }, [inputText])

    return (
        <>
            <div className="modal-wrapper-container">
                <div className="add-friend-modal-wrapper">
                    <IconX className="modal-exit" onClick={() => modalIsOpen(false)} />
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
}

export default AddFriendModal;