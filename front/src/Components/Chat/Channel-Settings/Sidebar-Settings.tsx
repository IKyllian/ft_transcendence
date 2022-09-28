import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChatInterface } from "../../../Types/Datas-Examples";
import axios from "axios";
import { baseUrl } from "../../../env";
import { useAppSelector } from '../../../Redux/Hooks'

function SidebarSettings(props: {setSidebarItem: Function, channelDatas: ChatInterface | undefined}) {
    const {setSidebarItem, channelDatas} = props;

    const navigate = useNavigate();
    const params = useParams();
    let authDatas = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (channelDatas === undefined || !channelDatas.isChannel)
            navigate(-1);
    }, [channelDatas, navigate]);

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

    return (channelDatas === undefined) ? (
        <> </> // A revoir pour le faire plus proprement
    ) : (
        <div className="sidebar-setting">
            <div className="sidebar-wrapper">
                <p> # {channelDatas!.isChannel && 
                    channelDatas!.channelName!} </p>
                <ul>
                    <li onClick={() => setSidebarItem("Settings")}> Settings </li>
                    <li onClick={() => setSidebarItem("Users")}> Users (4) </li>
                    <li onClick={() => setSidebarItem("Invitations")}> Invitations </li>
                </ul>
                <div className="separate-line"> </div>
                <button onClick={() => leaveChannel()}> Leave Channel </button>
            </div>
        </div>
    );
}

export default SidebarSettings;