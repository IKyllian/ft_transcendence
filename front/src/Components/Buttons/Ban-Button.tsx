import { useContext } from "react";
import { SocketContext } from "../../App";
import { useForm } from "react-hook-form";
import { IconSend } from "@tabler/icons";


function BanButton(props: {senderId: number, chanId: number}) {
    const { senderId, chanId } = props;
    const { register, reset, handleSubmit, formState: {errors}} = useForm<{numberInput: string}>();

    const {socket} = useContext(SocketContext);

    const handleClick = handleSubmit((data) => {
        const number: number = parseInt(data.numberInput);
        if (number > 10 && number < 3600) {
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
                    <input type="number" min="10" max="3600" {...register("numberInput")} placeholder='in second' />
                    <button type="submit"> <IconSend /> </button>
                </form>
            </div>
        </div>
    </>  
    );
}

export default BanButton;