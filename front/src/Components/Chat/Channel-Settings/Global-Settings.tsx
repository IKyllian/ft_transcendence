import { useForm } from "react-hook-form";
import api from "../../../Api/Api";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { changeChannelSettings } from "../../../Redux/ChannelSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { ChannelModes, ChannelModesArray } from "../../../Types/Chat-Types";
import { ChanModeToString, selectChanMode } from "../../../Utils/Utils-Chat";

interface ChanOptionState {
    chanMode: string,
    password?: string,
}

function GlobalSettings() {

    return (
        <>
            <FormChanName />
            <FormChanType />
        </>
    );
}

function FormChanName() {
    const { channelDatas } = useAppSelector((state) => state.channel);
    const { register, handleSubmit, watch, formState: {errors} } = useForm<{chanName: String}>({
        defaultValues: {
            chanName: channelDatas!.name,
        }
    });
    const dispatch = useAppDispatch();

    const formChanName = handleSubmit((data, e) => {
        e?.preventDefault();
        
        api.patch(`/channel/edit-name`, {chanId: channelDatas!.id, name: data.chanName})
        .then(response => {
            dispatch(changeChannelSettings({chanName: response.data.name, option: response.data.option}));
            dispatch(addAlert({message: "Channel name updated", type: AlertType.SUCCESS}));
        })
        .catch(err => {
            console.log(err);
        })
    })

    const watchChannelName = watch('chanName');

    return (
        <form className="radio-form" onSubmit={formChanName}>
            <label >
                Channel Name
                <div className="label-input-wrapper">
                    <input
                        type="text"
                        {...register("chanName", {
                            minLength: {
                                value: 2,
                                message: "Min length is 2"
                            },
                            required: "Channel name is required"
                        })}
                    />
                    { watchChannelName !== channelDatas!.name && <button type="submit"> Save </button> }
                </div>
            </label>
        </form>
    );
}

function FormChanType() {
    const { channelDatas } = useAppSelector((state) => state.channel);
    const { register, handleSubmit, watch, formState: {errors} } = useForm<ChanOptionState>({
        defaultValues: {
            chanMode: ChanModeToString(channelDatas!.option),
        },
    });
    const dispatch = useAppDispatch();
    const channelMode = watch('chanMode');

    const formOptionSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        let payload: {chanId: number, option: ChannelModes, password?: string} = {
            chanId: channelDatas!.id,
            option: selectChanMode(data.chanMode),
        }

        if (data.chanMode === "protected")
            payload = {...payload, password: data.password};

        api.patch(`/channel/edit-option`, payload)
        .then(response => {
            dispatch(changeChannelSettings({chanName: response.data.name, option: response.data.option}));
            dispatch(addAlert({message: "Channel type updated", type: AlertType.SUCCESS}));
        })
        .catch(err => {
            console.log(err);
        })
    });

    const checkMode = (elem: string): boolean => {
        if (elem === "public" && channelDatas!.option === ChannelModes.PUBLIC)
            return true;
        else if (elem === "private" && channelDatas!.option === ChannelModes.PRIVATE)
            return true;
        else if (elem === "protected" && channelDatas!.option === ChannelModes.PROTECTED)
            return false;
        return false;
    }

    return (
        <form className="radio-form" onSubmit={formOptionSubmit}>
            {
                ChannelModesArray.map((elem, index) =>
                    <label key={index} >
                        <input
                            className="radio-input"
                            key={index}
                            type="radio"
                            value={elem}
                            {...register("chanMode", {required: "This is required"})}
                        />
                        {elem}
                        {
                            elem === "protected" && channelMode == "protected" &&
                            <label className="labelTextInput">
                                Password :
                                { errors.password && <p className="txt-form-error"> {errors.password.message} </p> }
                                <input
                                    className="input-text" 
                                    type="password"
                                    placeholder="password"
                                    {...register("password", {
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
                <button className="saveInput" type="submit"> Save </button>
            }
        </form>
    );
}

export default GlobalSettings;