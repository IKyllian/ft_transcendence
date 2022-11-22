import { IconSend } from "@tabler/icons";
import { useContext } from "react";
import { SocketContext } from "../../App";
import { Channel, UserTimeout } from "../../Types/Chat-Types";
import { UserIsMute } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";

function MuteButton(props: {senderId: number, chanId: number, usersTimeout: UserTimeout[]}) {
    const { senderId, chanId, usersTimeout } = props;
    const senderIsMute: boolean = UserIsMute(usersTimeout, senderId);
    const { register, reset, handleSubmit, formState: {errors} } = useForm<{numberInput: string}>();
    
    const {socket} = useContext(SocketContext);

    const onUnmute = () => {
        if (senderIsMute) {
            socket?.emit("UnMute", {
                userId: senderId,
                chanId: chanId,
            });
        }
    }

    const onMute = (time?: number) => {
        console.log("time", time);
        if (!senderIsMute) {
            socket?.emit("Mute", {
                userId: senderId,
                chanId: chanId,
                time: time,
            });
        }
    }

    const handleClick = handleSubmit((data) => {
        console.log("data", data);
        const number: number = parseInt(data.numberInput);
        if (number > 10 && number < 3600)
            onMute(number);
    });

    console.log("Errors", errors);

    return (
        <>
            <div className="dropdown-button">
                <span onClick={() => onUnmute()}> {senderIsMute ? "unmute" : "mute"} </span>
                {
                    !senderIsMute &&
                    <div className="right-menu-dropdown">
                        <p onClick={() => onMute()}> Perma mute </p>
                        <span className="right-menu-dropdown-separator"> OR </span>
                        <form className="input-dropdown-wrapper" onSubmit={handleClick}>
                            {errors.numberInput && <p className="timeout-error"> {errors.numberInput.message} </p>}
                            <div className="input-container">
                                <input type="number" max="3600" {...register("numberInput", { required: "Time is required", minLength: {value: 10, message: "Must be minimum 10sec"}})} placeholder='in second' />
                                <button type="submit"> <IconSend /> </button>
                            </div>
                        </form>
                    </div>
                }
            </div>
        </>  
    );
}

export default MuteButton;