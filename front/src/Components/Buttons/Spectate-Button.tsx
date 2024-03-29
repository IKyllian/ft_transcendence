import { IconEye } from "@tabler/icons";
import { useContext } from "react";
import { SocketContext } from "../../App";

function SpectateButton(props: {in_game_id: string | null, className?: string}) {
    const {in_game_id, className} = props;
    const {socket} = useContext(SocketContext);

    const spectateClick = () => {
        socket?.emit("get_gameinfo", in_game_id);
    }

    return in_game_id !== null ? (
        <div className="tooltip-icon-wrapper" data-tooltips="Spectate">
            <IconEye onClick={() => spectateClick()} className={className ? className : ""} />
        </div>
    ) : (
        <> </>
    );
}

export default SpectateButton;