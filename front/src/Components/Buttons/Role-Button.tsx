import { useContext } from "react";
import { SocketContext } from "../../App";
import { ChannelUser } from "../../Types/Chat-Types";

function RoleButton(props: {sender: ChannelUser}) {
    const {sender} = props;

    const {socket} = useContext(SocketContext);

    const handleClick = () => {
        console.log("sender", sender);
        socket?.emit("ChangeRole", {
            userId: sender.user.id,
            chanId: sender.channelId,
            role: sender.role === "clampin" ? "moderator" : "clampin",
        })
    }

    return (
        <p onClick={() => handleClick()}> {sender.role === "clampin" ? "Set as administrator" : "Set as normal user"}  </p>
    );
}

export default RoleButton;