import { useEffect } from "react";
import {useForm} from "react-hook-form";
import { Channel, ChannelModes, ChannelModesArray } from "../../../Types/Chat-Types";

function GlobalSettings(props: {chanDatas: Channel}) {
    const {chanDatas} = props;
    const { register, handleSubmit, watch, formState: {errors} } = useForm<{chanMode: ChannelModes, password?: string}>({defaultValues: {chanMode: chanDatas.option}});
    const channelMode = watch('chanMode');

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log("data");
    });

    const checkMode = (elem: string): boolean => {
        if (elem === "public" && chanDatas.option === ChannelModes.PUBLIC)
            return true;
        else if (elem === "private" && chanDatas.option === ChannelModes.PRIVATE)
            return true;
        else if (elem === "protected" && chanDatas.option === ChannelModes.PROTECTED)
            return true;
        return false;
    }

    const setModeValue = (elem: string): ChannelModes => {
        if (elem === "public")
            return ChannelModes.PUBLIC;
        else if (elem === "private")
            return ChannelModes.PRIVATE;
        return ChannelModes.PROTECTED;
    }

    return (
        <div>
            <form className="radio-form" onSubmit={formSubmit}>
                {
                    ChannelModesArray.map((elem, index) =>
                        <label key={index} >
                            <div>
                                <input
                                    key={index}
                                    type="radio"
                                    value={setModeValue(elem)}
                                    defaultChecked={checkMode(elem)}
                                    {...register("chanMode", {required: "This is required"})}
                                />
                                {elem}
                            </div>
                            {
                                elem === "protected" && channelMode == ChannelModes.PROTECTED &&
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
                    channelMode != chanDatas.option &&
                    <input className="saveInput" type="submit" value="Save" />
                }
            </form> 
        </div>
    );
}

export default GlobalSettings;