import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../env";
import { useAppSelector } from '../../../Redux/Hooks'
import { Channel } from "../../../Types/Chat-Types"

function SidebarSettings(props: {setSidebarItem: Function, channelDatas: Channel}) {
    const {setSidebarItem, channelDatas} = props;

    const params = useParams();
    let authDatas = useAppSelector((state) => state.auth);

    const leaveChannel = () => {
        console.log(authDatas.token);
        console.log(`${baseUrl}/channel/${params.channelId}/leave`);
        axios.post(`${baseUrl}/channel/${params.chatId}/leave`, {
            headers: {
                "Authorization": `Bearer ${authDatas.token}`,
            }
        })
        .then(async (response) => {
            console.log(response);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    return (
        <div className="sidebar-setting">
            <div className="sidebar-wrapper">
                <p> # {channelDatas!.name} </p>
                <ul>
                    <li onClick={() => setSidebarItem("Settings")}> Settings </li>
                    <li onClick={() => setSidebarItem("Users")}> Users ({channelDatas.channelUsers.length}) </li>
                    <li onClick={() => setSidebarItem("Invitations")}> Invitations </li>
                </ul>
                <div className="separate-line"> </div>
                <button onClick={() => leaveChannel()}> Leave Channel </button>
            </div>
        </div>
    );
}

export default SidebarSettings;