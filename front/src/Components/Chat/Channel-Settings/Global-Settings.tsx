import axios from "axios";
import { useForm } from "react-hook-form";
import { baseUrl } from "../../../env";
import { changeChannelSettings } from "../../../Redux/ChannelSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { Channel, ChannelModes, ChannelModesArray } from "../../../Types/Chat-Types";
import { ChanModeToString, selectChanMode } from "../../../Utils/Utils-Chat";

interface ChanFormState {
    nameForm: {
        chanName: string,
    },
    chanOption: {
        chanMode: string,
        password?: string,
    },
}

function GlobalSettings(props: {chanDatas: Channel}) {
    const {chanDatas} = props;
    const { register, handleSubmit, watch, formState: {errors} } = useForm<ChanFormState>({
        defaultValues: {
            chanOption: {
                chanMode: ChanModeToString(chanDatas.option),
            },
            nameForm: {
                chanName: chanDatas.name,
            },
        }
    });
    const channelMode = watch('chanOption.chanMode');
    const watchChannelName = watch('nameForm.chanName');
    const {token} = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const formOptionSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        let payload: {chanId: number, option: ChannelModes, password?: string} = {
            chanId: chanDatas.id,
            option: selectChanMode(data.chanOption.chanMode),
        }
        if (data.chanOption.chanMode === "protected")
            payload = {...payload, password: data.chanOption.password};
        axios.patch(`${baseUrl}/channel/edit-option`, payload, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            console.log("RESPONSE ", response.data);
            dispatch(changeChannelSettings({chanName: response.data.name, option: response.data.option}));
        })
        .catch(err => {
            console.log(err);
        })
    });

    const formChanName = handleSubmit((data, e) => {
        e?.preventDefault();
        axios.patch(`${baseUrl}/channel/edit-name`, {chanId: chanDatas.id, name: data.nameForm.chanName}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            console.log(response);
            dispatch(changeChannelSettings({chanName: response.data.name, option: response.data.option}));
        })
        .catch(err => {
            console.log(err);
        })
    })

    const checkMode = (elem: string): boolean => {
        if (elem === "public" && chanDatas.option === ChannelModes.PUBLIC)
            return true;
        else if (elem === "private" && chanDatas.option === ChannelModes.PRIVATE)
            return true;
        else if (elem === "protected" && chanDatas.option === ChannelModes.PROTECTED)
            return true;
        return false;
    }

    return (
        <>
            <form className="radio-form" onSubmit={formChanName}>
                <label >
                    Channel Name
                    <div className="label-input-wrapper">
                        <input
                            type="text"
                            {...register("nameForm.chanName", {
                                minLength: {
                                    value: 2,
                                    message: "Min length is 2"
                                },
                                required: "Channel name is required"
                            })}
                        />
                        { watchChannelName !== chanDatas.name && <button type="submit"> Save </button> }
                    </div>
                </label>
            </form>
            <form className="radio-form" onSubmit={formOptionSubmit}>
                {
                    ChannelModesArray.map((elem, index) =>
                        <label key={index} >
                            <input
                                className="radio-input"
                                key={index}
                                type="radio"
                                value={elem}
                                {...register("chanOption.chanMode", {required: "This is required"})}
                            />
                            {elem}
                            {
                                elem === "protected" && channelMode == "protected" &&
                                <label className="labelTextInput">
                                    Password :
                                    { errors.chanOption && errors.chanOption.password && <p className="txt-form-error"> {errors.chanOption.password.message} </p> }
                                    <input
                                        className="input-text" 
                                        type="password"
                                        placeholder="password"
                                        {...register("chanOption.password", {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 5,
                                                message: "Min length is 5",
                                            }
                                        })} />
                                </label>
                            }
                        </label>
                    )
                }
                {
                    !checkMode(channelMode) &&
                    <input className="saveInput" type="submit" value="Save" />
                }
            </form> 
        </>
    );
}

export default GlobalSettings;