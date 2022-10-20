import { useContext } from "react";
import { SocketContext } from "../../App";

function BanButton(props: {senderId: number, chanId: number}) {
    const { senderId, chanId } = props;

    const {socket} = useContext(SocketContext);

    const handleClick = () => {
        socket?.emit("Ban", {
            userId: senderId,
            chanId: chanId,
        });
    }

    return (
        <p onClick={() => handleClick()}> ban </p>
    );
}

export default BanButton;