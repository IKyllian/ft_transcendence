import { useContext, useState } from "react";
import { SocketContext } from "../../App";
import { ChannelUser } from "../../Types/Chat-Types";
import AlertValidation from "../Alert-Validation";

function RoleButton(props: {sender: ChannelUser}) {
    const {sender} = props;
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const closeAlert = () => {
        setShowAlert(false);
    }

    const {socket} = useContext(SocketContext);

    const handleClick = () => {
        socket?.emit("ChangeRole", {
            userId: sender.user.id,
            chanId: sender.channelId,
            role: sender.role === "clampin" ? "moderator" : "clampin",
        })
    }

    return (
        <>
            {/* <AlertValidation closeFunction={closeAlert} validateFunction={handleClick} textAlert="Ceci est une alerte" /> */}
            <p onClick={() => handleClick()}> {sender.role === "clampin" ? "Set as administrator" : "Set as normal user"}  </p>
            {/* <p onClick={() => handleClick()}> {sender.role === "clampin" ? "Set as Owner"}  </p> */}
        </>
    );
}

export default RoleButton;