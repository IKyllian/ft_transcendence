import SearchBarPlayers from "../SearchBarPlayers";
import { useForm } from 'react-hook-form';
import axios from "axios";

import { useAppSelector } from '../../Redux/Hooks'
import { baseUrl } from "../../env";
import { IconX } from '@tabler/icons';
import { useEffect, useState } from "react";
import { ChannelsInterfaceFront } from "../../Types/Chat-Types";
import { useNavigate } from "react-router-dom";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: number;
}

function ChatModal(props: {setShowModal: Function, showModal: number, setChannelsDatas: Function}) {
    const { register, handleSubmit, watch, formState: {errors} } = useForm<FormValues>();
    const { setShowModal, showModal, setChannelsDatas } = props;

    const channelMode = watch('chanMode');

    const navigate = useNavigate();
    let authDatas = useAppSelector((state) => state.auth);

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log(data);
        axios.post(`${baseUrl}/channel`, {name: data.chanName, option: data.chanMode}, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
           console.log(response);
           setChannelsDatas((state: ChannelsInterfaceFront[]) => [...state, {channel: response.data, isActive: "false"}]);
           setShowModal(false);
           navigate(`/chat/${response.data.id}`);
        }).catch(err => {
            console.log(err);
        })
    })

    if (showModal === 1) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => setShowModal(false) } />
                <h3> Create Channel </h3>
                <form onSubmit={formSubmit}>
                    <div className="checkbox-container">
                        
                        {
                            ["public", "protected" ,"privée"].map((elem, index) => 
                                <label key={index}>
                                    {elem}
                                    <input
                                        type="radio"
                                        value={elem}
                                        {...register("chanMode", {required: "This is required"})}
                                    />
                                </label>
                            )
                        }
                    </div>
                    {errors.chanMode && <p className="txt-form-error"> {errors.chanMode.message} </p>}
                    <label className="labelTextInput">
                        Channel name:
                        <input
                            type="text"
                            placeholder="Channel name..."
                            {...register("chanName", {
                                required: "Channel name is required",
                                minLength: {
                                    value: 2,
                                    message: "Min length is 2"
                                }
                            })}
                        />
                        {errors.chanName && <p className="txt-form-error"> {errors.chanName.message} </p>}
                    </label>
                    {
                        channelMode === "protected" && 
                        <label className="labelTextInput">
                            Password :
                            <input type="password" placeholder="password" {...register("password")} />
                        </label>
                    }
                    <SearchBarPlayers functionality="chanInvite" register={register} />
                    <div className="chat-modal-buttons">
                        <button onClick={() => setShowModal(false) }> Cancel </button>
                        <input type="submit" name="Save" />
                    </div>
                </form>
            </div>        
        );
    } else if (showModal === 2) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => setShowModal(false) } />
                <SearchBarPlayers functionality="sendMessage" />
            </div>
        );
    } else {
        return (
            <> </>
        );
    }
}

export default ChatModal;