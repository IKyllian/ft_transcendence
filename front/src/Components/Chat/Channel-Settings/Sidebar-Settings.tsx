import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from '../../../Redux/Hooks'
import { Channel } from "../../../Types/Chat-Types"
import { fetchLeaveChannel } from "../../../Api/Chat/Chat-Action";

function SidebarSettings(props: {setSidebarItem: Function, channelDatas: Channel, loggedUserIsOwner: boolean}) {
    const {setSidebarItem, channelDatas, loggedUserIsOwner} = props;

    const params = useParams();
    const navigate = useNavigate();
    let authDatas = useAppSelector((state) => state.auth);

    const leaveChannel = () => {
        if (params.channelId) {
            fetchLeaveChannel(parseInt(params.channelId), authDatas.token, navigate);
        }
    }

    return (
        <div className="sidebar-setting">
            <div className="sidebar-wrapper">
                <p> # {channelDatas!.name} </p>
                <ul>
                    {loggedUserIsOwner && <li onClick={() => setSidebarItem("Settings")}> Settings </li>}
                    <li onClick={() => setSidebarItem("Users")}> Users ({channelDatas.channelUsers.length}) </li>
                    {loggedUserIsOwner && <li onClick={() => setSidebarItem("Invitations")}> Invitations </li>}
                </ul>
                <div className="separate-line"> </div>
                <button onClick={() => leaveChannel()}> Leave Channel </button>
            </div>
        </div>
    );
}

export default SidebarSettings;