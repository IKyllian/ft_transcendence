import { useContext } from "react";
import { SocketContext } from "../../App";
import { Channel } from "../../Types/Chat-Types";
import { UserIsMute } from "../../Utils/Utils-Chat";

function MuteButton(props: {senderId: number, chan: Channel}) {
    const { senderId, chan } = props;
    const senderIsMute: boolean = UserIsMute(chan.channelUsers, senderId);
    
    const {socket} = useContext(SocketContext);

    const handleClick = () => {
        console.log("Handle Click", senderIsMute);
        console.log("senderId", senderId);
        console.log("chan.id", chan.id);
        if (!senderIsMute) {
            socket?.emit("Mute", {
                userId: senderId,
                chanId: chan.id,
            });
        } else {
            socket?.emit("UnMute", {
                userId: senderId,
                chanId: chan.id,
            });
        }
    }

    return (
        <p onClick={() => handleClick()}>  {senderIsMute ? "unmute" : "mute"} </p>
    );
}

export default MuteButton;