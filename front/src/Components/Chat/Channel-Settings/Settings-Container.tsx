import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons";

import SidebarSettings from "./Sidebar-Settings";
import RenderSettingPage from "./Render-Setting-Page";
import { useLocation, useNavigate } from "react-router-dom";
import { Channel } from "../../../Types/Chat-Types"
import LoadingSpin from "../../Utils/Loading-Spin";
import { useAppSelector } from "../../../Redux/Hooks";

function ChannelSettings() {
    const [sidebarItem, setSidebarItem] = useState<string>("Settings");
    const [channelDatas, setChannelDatas] = useState<Channel | undefined>(undefined);
    const [loggedUserIsOwner, setLoggedUserIsOwner] = useState<boolean>(false);

    const location = useLocation();
    const navigate = useNavigate();
    const authDatas = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (location && location.state) {
            const locationState = location.state as Channel;
            setChannelDatas(locationState);
            if (locationState.channelUsers.find((elem) => elem.user.id === authDatas.currentUser?.id && (elem.role === "owner" || elem.role === "moderator")))
                setLoggedUserIsOwner(true);
        }
    }, [location])

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