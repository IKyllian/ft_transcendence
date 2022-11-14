import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks'
import { Channel } from "../../../Types/Chat-Types"
import { SocketContext } from "../../../App";
import { useContext } from "react";
import { removeChannel } from "../../../Redux/ChatSlice";

function SidebarSettings(props: {setSidebarItem: Function, channelDatas: Channel, loggedUserIsOwner: boolean}) {
    const {setSidebarItem, channelDatas, loggedUserIsOwner} = props;

    const params = useParams();
    const dispatch = useAppDispatch();

    const {socket} = useContext(SocketContext);

    const leaveChannel = () => {
        console.log("params", params);
        if (params.channelId) {
            const chanId: number = parseInt(params.channelId);
            console.log("chanId", chanId);
            socket?.emit("LeaveChannel", {id: chanId});
            dispatch(removeChannel(chanId));
        }
    }

    return (
        <div className="sidebar-setting">
            <div className="sidebar-wrapper">
                <p> # {channelDatas!.name} </p>
                <ul>
                    {loggedUserIsOwner && <li onClick={() => setSidebarItem("Settings")}> Settings </li>}
                    <li onClick={() => setSidebarItem("Users")}> Users ({channelDatas.channelUsers.length}) </li>
                    {loggedUserIsOwner && <li onClick={() => setSidebarItem("Invitations")}> Banned User </li>}
                </ul>
                <div className="separate-line"> </div>
                <button onClick={() => leaveChannel()}> Leave Channel </button>
            </div>
        </div>
    );
}

export default SidebarSettings;