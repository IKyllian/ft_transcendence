import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons";

import SidebarSettings from "./Sidebar-Settings";
import RenderSettingPage from "./Render-Setting-Page";
import { useNavigate, useParams } from "react-router-dom";
import { ChannelsDatas, ChatInterface } from "../../../Interfaces/Datas-Examples";


function ChannelSettings() {
    const [sidebarItem, setSidebarItem] = useState<string>("Settings");
    const [channelDatas, setChannelDatas] = useState<ChatInterface | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
     
    let params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setChannelDatas(ChannelsDatas.find((elem) => elem.id === parseInt(params!.channelId!, 10)));
        setLoading(false);
    }, [params])

    if (loading) {
        return (
            <h2> Loading.... </h2>
        );
    } else {
        return (
            <div className="channel-setting-container">
                <SidebarSettings setSidebarItem={setSidebarItem} channelDatas={channelDatas} />
                <div className="content-setting-container">
                    <div className="content-wrapper">
                        <RenderSettingPage item={sidebarItem} />
                    </div>
                </div>
                <IconX className="leave-icon" onClick={() => navigate(-1)} />
            </div>
        );
    }
}

export default ChannelSettings;