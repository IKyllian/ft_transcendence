import React, { useState } from "react";
import SearchBarPlayers from "../Search-Bar/SearchBarPlayers";
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../Redux/Hooks'
import { IconX } from '@tabler/icons';
import { useNavigate, useParams } from "react-router-dom";
import { fetchCreateChannel } from "../../Api/Chat/Chat-Action";
import { useContext } from "react";
import { SocketContext } from "../../App";
import { UserInterface } from "../../Types/User-Types";
import { fetchSearchAllUsers } from "../../Api/User-Fetch";
import { fetchSearchUsersToInvite } from "../../Api/Chat/Chat-Fetch";
import { SearchBarFunctionality } from "../../Types/Utils-Types";
import { ChannelModes, CreateChanBodyRequest, ChannelModesArray } from "../../Types/Chat-Types"
import { selectChanMode } from "../../Utils/Utils-Chat";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: string[];
}

function ChatModal(props: {onCloseModal: Function, showModal: number}) {
    const { register, handleSubmit, watch, reset, formState: {errors}, setError } = useForm<FormValues>();
    const [usersInvited, setUsersInvited] = useState<UserInterface[]>([]);
    const { onCloseModal, showModal } = props;

    const channelMode = watch('chanMode');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);
    const params = useParams();

    const checkboxOnChange = (val: UserInterface) => {
        if (usersInvited.find(elem => elem.id === val.id))
            setUsersInvited(prev => prev.filter(elem => elem.id !== val.id));
        else
            setUsersInvited(prev => [...prev, val]);
    }

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        if (showModal === 1) {
            let body: CreateChanBodyRequest = {
                name: data.chanName,
                option: selectChanMode(data.chanMode),
            }
            if (body.option === ChannelModes.PROTECTED)
                body = {...body, password: data.password}
            fetchCreateChannel(body, usersInvited, dispatch, navigate, onCloseModal, socket!, setError);
        } else {
            if (usersInvited.length > 0 && params.channelId) {
                usersInvited.forEach(element => {
                    socket?.emit("ChannelInvite", {
                        chanId: +params.channelId!,
                        userId: element.id,
                    });
                });
                onCloseModal();
            }
        }
        reset();
        setUsersInvited([]);
    })

    if (showModal === 1 || showModal === 3) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => {onCloseModal(); setUsersInvited([])} } />
                <div className="form-modal-wrapper">
                    <h3> {showModal === 1 ? "Create Channel" : "Inviter des gens"}  </h3>
                    <form onSubmit={formSubmit}>
                        { showModal === 1 && 
                            <>
                                <div className="checkbox-container">
                                    {
                                        ChannelModesArray.map((elem, index) => 
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
                                        autoComplete="off"
                                        type="text"
                                        maxLength={15}
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
                                        <input
                                            type="password"
                                            maxLength={256}
                                            placeholder="password"
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 5,
                                                    message: "Min length is 5"
                                                }
                                            })}
                                        />
                                        {errors.password && <p className="txt-form-error"> {errors.password.message} </p>}
                                    </label>
                                }
                            </>
                        }
                        { showModal === 1 && <SearchBarPlayers functionality={SearchBarFunctionality.CHAN_INVITE_ON_CREATE} checkboxOnChange={checkboxOnChange} checkboxArray={usersInvited} fetchUserFunction={fetchSearchAllUsers} />}
                        { showModal === 3 && <SearchBarPlayers functionality={SearchBarFunctionality.CHAN_INVITE} checkboxOnChange={checkboxOnChange} checkboxArray={usersInvited} fetchUserFunction={fetchSearchUsersToInvite} />}
                        <div className="chat-modal-buttons">
                            <button onClick={() => onCloseModal() }> Cancel </button>
                            <input type="submit" name={showModal === 1 ? "Save" : "Envoyer"} />
                        </div>
                    </form>
                </div>
            </div>        
        );
    } else if (showModal === 2) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => onCloseModal() } />
                <SearchBarPlayers functionality={SearchBarFunctionality.SEND_MESSAGE} fetchUserFunction={fetchSearchAllUsers} />
            </div>
        );
    } else {
        return (
            <> </>
        );
    }
}

export default React.memo(ChatModal);
