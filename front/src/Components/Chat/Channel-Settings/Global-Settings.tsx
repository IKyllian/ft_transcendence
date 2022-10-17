import { useEffect } from "react";
import {useForm} from "react-hook-form";
import { Channel } from "../../../Types/Chat-Types";

function GlobalSettings(props: {chanDatas: Channel}) {
    const { register, handleSubmit, watch, formState: {errors} } = useForm<{chanMode: string, password?: string}>();
    const {chanDatas} = props;
    const channelMode = watch('chanMode');

    const formSubmit = handleSubmit((data, e) => {
        e?.preventDefault();
        console.log("data");
    });
    console.log(errors)

    return (
        <div>
            <form className="radio-form" onSubmit={formSubmit}>
                {
                    ["public", "protected", "privée"].map((elem, index) =>
                        <label key={index} >
                            <div>
                                <input
                                    key={index}
                                    type="radio"
                                    value={elem}
                                    defaultChecked={elem === chanDatas.option ? true : false}
                                    {...register("chanMode", {required: "This is required"})}
                                />
                                {elem}
                            </div>
                            {
                                elem === "protected" && channelMode === "protected" &&
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
                    channelMode !== chanDatas.option &&
                    <input className="saveInput" type="submit" value="Save" />
                }
            </form> 
        </div>
    );
}

export default GlobalSettings;