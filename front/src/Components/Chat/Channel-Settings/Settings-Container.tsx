import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons";

import SidebarSettings from "./Sidebar-Settings";
import RenderSettingPage from "./Render-Setting-Page";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Channel } from "../../../Types/Chat-Types"
import LoadingSpin from "../../Utils/Loading-Spin";

function ChannelSettings() {
    const [sidebarItem, setSidebarItem] = useState<string>("Settings");
    const [channelDatas, setChannelDatas] = useState<Channel | undefined>(undefined);

    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location && location.state) {
            const locationState = location.state as Channel;
            setChannelDatas(locationState);
        }
    }, [params, location])

    if (!channelDatas) {
        return (
            <div className="channel-setting-container">
                <LoadingSpin />
            </div>
        );
    } else {
        return (
            <div className="channel-setting-container">
                <SidebarSettings setSidebarItem={setSidebarItem} channelDatas={channelDatas} />
                <div className="content-setting-container">
                    <div className="content-wrapper">
                        <RenderSettingPage item={sidebarItem} channelDatas={channelDatas} />
                    </div>
                </div>
                <IconX className="leave-icon" onClick={() => navigate(-1)} />
            </div>
        );
    }
}

export default ChannelSettings;