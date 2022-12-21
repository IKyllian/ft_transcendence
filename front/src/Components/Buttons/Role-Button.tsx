import { useContext, useState } from "react";
import { SocketContext } from "../../App";
import { unsetOwner } from "../../Redux/ChannelSlice";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { ChannelUser } from "../../Types/Chat-Types";

function RoleButton(props: {sender: ChannelUser}) {
    const {sender} = props;
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const {loggedUserIsOwner} = useAppSelector(state => state.channel);
    const dispatch = useAppDispatch();

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

    const ownerClick = () => {
        socket?.emit("ChangeRole", {
            userId: sender.user.id,
            chanId: sender.channelId,
            role: "owner",
        })
        dispatch(unsetOwner());
    }

    return (
        <>
            <p onClick={() => handleClick()}> {sender.role === "clampin" ? "Set as administrator" : "Set as normal user"}  </p>
            {
                loggedUserIsOwner && 
                <p onClick={() => ownerClick()}> Set as Owner  </p>
            }
        </>
    );
}

export default RoleButton;