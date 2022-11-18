import { IconSend } from "@tabler/icons";
import { useContext } from "react";
import { SocketContext } from "../../App";
import { Channel } from "../../Types/Chat-Types";
import { UserIsMute } from "../../Utils/Utils-Chat";
import { useForm } from "react-hook-form";

function MuteButton(props: {senderId: number, chan: Channel}) {
    const { senderId, chan } = props;
    const senderIsMute: boolean = UserIsMute(chan.usersTimeout, senderId);
    const { register, reset, handleSubmit, formState: {errors} } = useForm<{numberInput: string}>();
    
    const {socket} = useContext(SocketContext);

    const onUnmute = () => {
        if (senderIsMute) {
            socket?.emit("UnMute", {
                userId: senderId,
                chanId: chan.id,
            });
        }
    }

    const onMute = (time?: number) => {
        console.log("time", time);
        if (!senderIsMute) {
            socket?.emit("Mute", {
                userId: senderId,
                chanId: chan.id,
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
                            <input type="number" min="10" max="3600" {...register("numberInput")} placeholder='in second' />
                            <button type="submit"> <IconSend /> </button>
                        </form>
                    </div>
                }
            </div>
        </>  
    );
}

export default MuteButton;