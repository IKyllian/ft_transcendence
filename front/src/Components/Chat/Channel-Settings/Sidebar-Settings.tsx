import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChannelInterface, PrivateMessageInterface } from "../../../Interfaces/Datas-Examples";

function SidebarSettings(props: {setSidebarItem: Function, channelDatas: ChannelInterface | PrivateMessageInterface | undefined}) {
    const {setSidebarItem, channelDatas} = props;
    const navigate = useNavigate();

    useEffect(() => {
        if (channelDatas === undefined || !("channelName" in channelDatas))
            navigate(-1);
    }, [channelDatas, navigate]);

    if (channelDatas === undefined) {
        return (
           <> </> // A revoir pour le faire plus proprement
        );
    } else {
        return (
            <div className="sidebar-setting">
                <div className="sidebar-wrapper">
                    <p> # { "channelName" in channelDatas! && 
                        channelDatas!.channelName!} </p>
                    <ul>
                        <li onClick={() => setSidebarItem("Settings")}> Settings </li>
                        <li onClick={() => setSidebarItem("Users")}> Users (4) </li>
                        <li onClick={() => setSidebarItem("Invitations")}> Invitations </li>
                    </ul>
                    <div className="separate-line"> </div>
                    <button> Leave Channel </button>
                </div>
            </div>
        );
    }
}

export default SidebarSettings;