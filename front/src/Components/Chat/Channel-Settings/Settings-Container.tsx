import { useEffect, useState, useContext } from "react";
import { IconX } from "@tabler/icons";

import SidebarSettings from "./Sidebar-Settings";
import RenderSettingPage from "./Render-Setting-Page";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Channel } from "../../../Types/Chat-Types"
import LoadingSpin from "../../Utils/Loading-Spin";
import { useAppSelector } from "../../../Redux/Hooks";
import { SocketContext } from "../../../App";
import { ChannelUser } from "../../../Types/Chat-Types";

function ChannelSettings() {
    const [sidebarItem, setSidebarItem] = useState<string>("Users");
    // const [channelDatas, setChannelDatas] = useState<Channel | undefined>(undefined);
    // const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);
    
    // const location = useLocation();
    const navigate = useNavigate();
    // const authDatas = useAppSelector((state) => state.auth);
    const {channelDatas, loggedUserIsOwner} = useAppSelector((state) => state.channel);
    // const {socket} = useContext(SocketContext);
    // const params = useParams();
    // const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;

    // useEffect(() => {
    //     if (channelId) {
    //         socket!.emit("JoinChannelRoom", {
    //             id: channelId,
    //         });
    //     }
        
    //     return () => {
    //         socket!.emit("LeaveChannelRoom", {
    //             id: channelId,
    //         });
    //         socket?.off("ChannelUserUpdate");
    //     }
    // }, [location])

    if (!channelDatas) {
        return (
            <div className="channel-setting-container">
                <LoadingSpin />
            </div>
        );
    } else {
        return (
            <div className="channel-setting-container">
                <SidebarSettings setSidebarItem={setSidebarItem} channelDatas={channelDatas} loggedUserIsOwner={loggedUserIsOwner} />
                <div className="content-setting-container">
                    <div className="content-wrapper">
                        <RenderSettingPage item={sidebarItem} channelDatas={channelDatas} loggedUserIsOwner={loggedUserIsOwner} />
                    </div>
                </div>
                <IconX className="leave-icon" onClick={() => navigate(-1)} />
            </div>
        );
    }
}

export default ChannelSettings;