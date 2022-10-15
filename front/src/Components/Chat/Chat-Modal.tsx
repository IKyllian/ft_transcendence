import SearchBarPlayers from "../SearchBarPlayers";
import { useForm } from 'react-hook-form';
import axios from "axios";

import { useAppSelector, useAppDispatch } from '../../Redux/Hooks'
import { baseUrl } from "../../env";
import { IconX } from '@tabler/icons';
import { useNavigate } from "react-router-dom";
import { addChannel } from "../../Redux/ChatSlice";

type FormValues = {
    chanMode: string,
    chanName: string,
    password?: string,
    usersIdInvited?: number;
}

function ChatModal(props: {onCloseModal: Function, showModal: number}) {
    const { register, handleSubmit, watch, formState: {errors} } = useForm<FormValues>();
    const { onCloseModal, showModal } = props;

    const channelMode = watch('chanMode');

    const navigate = useNavigate();
    let authDatas = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        let body: {
            name: string,
            option: string,
            password?: string,
        } = {
            name: data.chanName,
            option: data.chanMode,
        }
        if (data.chanMode === "protected")
            body = {...body, password: data.password}
        axios.post(`${baseUrl}/channel`, body, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then((response) => {
           console.log(response);
           dispatch(addChannel({channel: response.data, isActive: "false"}));
           onCloseModal();
           navigate(`/chat/${response.data.id}`);
        }).catch(err => {
            console.log(err);
        })
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

export default ChatModal;