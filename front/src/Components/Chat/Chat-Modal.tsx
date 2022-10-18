import React, { useState } from "react";
import SearchBarPlayers from "../SearchBarPlayers";
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../../Redux/Hooks'
import { IconX } from '@tabler/icons';
import { useNavigate } from "react-router-dom";
import { fetchCreateChannel } from "../../Api/Chat/Chat-Action";
import { useContext } from "react";
import { SocketContext } from "../../App";
import { UserInterface } from "../../Types/User-Types";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: string[];
}

type BodyRequest = {
    name: string,
    option: string,
    password?: string,
}

function ChatModal(props: {onCloseModal: Function, showModal: number}) {
    const { register, handleSubmit, watch, reset, formState: {errors} } = useForm<FormValues>();
    const [usersInvited, setUsersInvited] = useState<UserInterface[]>([]);
    const { onCloseModal, showModal } = props;

    const channelMode = watch('chanMode');
    const navigate = useNavigate();
    const authDatas = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);

    const checkboxOnChange = (val: UserInterface) => {
        if (usersInvited.find(elem => elem.id === val.id))
            setUsersInvited(prev => prev.filter(elem => elem.id !== val.id));
        else
            setUsersInvited(prev => [...prev, val]);
    }

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        let body: BodyRequest = {
            name: data.chanName,
            option: data.chanMode,
        }
        if (data.chanMode === "protected")
            body = {...body, password: data.password}
        fetchCreateChannel(body, usersInvited, authDatas.token, dispatch, navigate, onCloseModal, socket!);
        reset();
        setUsersInvited([]);
    })

    if (showModal === 1) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => onCloseModal() } />
                <h3> Create Channel </h3>
                <form onSubmit={formSubmit}>
                    <div className="checkbox-container">
                        
                        {
                            ["public", "protected" ,"privée"].map((elem, index) => 
                                <label key={index}>
                                    {elem}
                                    <input
                                        defaultChecked={index === 0 ? true : false}
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

                    <SearchBarPlayers functionality="chanInvite" checkboxOnChange={checkboxOnChange} checkboxArray={usersInvited}  />

                    <div className="chat-modal-buttons">
                        <button onClick={() => onCloseModal() }> Cancel </button>
                        <input type="submit" name="Save" />
                    </div>
                </form>
            </div>        
        );
    } else if (showModal === 2) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => onCloseModal() } />
                <SearchBarPlayers functionality="sendMessage" />
            </div>
        );
    } else {
        return (
            <> </>
        );
    }
}

export default React.memo(ChatModal);
