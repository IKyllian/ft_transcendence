import { useContext } from "react";
import { SocketContext } from "../../App";
import { useForm } from "react-hook-form";
import { IconSend } from "@tabler/icons";

function BanButton(props: {senderId: number, chanId: number}) {
    const { senderId, chanId } = props;
    const { register, reset, handleSubmit, formState: {errors}} = useForm<{numberInput: string}>();

    const {socket} = useContext(SocketContext);

    const handleClick = handleSubmit((data) => {
        const number: number = +data.numberInput;
        if (number >= 10 && number <= 3600) {
            socket?.emit("Ban", {
                userId: senderId,
                chanId: chanId,
                time: number,
            });
        }
    })

    const permaBan = () => {
        socket?.emit("Ban", {
            userId: senderId,
            chanId: chanId,
        });
    }

    return (
        <>
        <div className="dropdown-button">
            <span> ban </span>
            <div className="right-menu-dropdown">
                <p onClick={() => permaBan()}> Perma ban </p>
                <span className="right-menu-dropdown-separator"> OR </span>
                <form className="input-dropdown-wrapper" onSubmit={handleClick}>
                    {errors.numberInput && <p className="timeout-error"> {errors.numberInput.message} </p>}
                    <div className="input-container">
                        <input type="number" min="10" max="3600" {...register("numberInput", { required: "Time is required" })} placeholder='in second' />
                        <button type="submit"> <IconSend /> </button>
                    </div>
                </form>
            </div>
        </div>
    </>  
    );
}

export default BanButton;