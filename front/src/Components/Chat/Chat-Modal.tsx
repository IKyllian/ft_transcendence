import SearchBarPlayers from "../SearchBarPlayers";
import { useForm } from 'react-hook-form';

import { IconX } from '@tabler/icons';
import { useEffect, useState } from "react";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: number;
}

function ChatModal(props: {setShowModal: Function, showModal: number}) {
    const { register, handleSubmit, formState: {errors} } = useForm<FormValues>();
    const { setShowModal, showModal } = props;

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log(data);
    })

    if (showModal === 1) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => setShowModal(false) } />
                <h3> Create Channel </h3>
                <form onSubmit={formSubmit}>
                    <div className="checkbox-container">
                        
                        {
                            ["public", "privée"].map((elem, index) => 
                                <label key={index}>
                                    {index === 0 ? "Public" : "Privée"}
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
                    <label className="labelTextInput">
                        Password (optional):
                        <input type="password" placeholder="(optional)" {...register("password")} />
                    </label>
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