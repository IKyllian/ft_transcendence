import { useContext, useEffect, useState } from "react";
import { IconX } from "@tabler/icons";

import SidebarSettings from "./Sidebar-Settings";
import RenderSettingPage from "./Render-Setting-Page";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpin from "../../Utils/Loading-Spin";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { SocketContext } from "../../../App";
import { setChannelId, unsetChannelDatas, unsetChannelId } from "../../../Redux/ChannelSlice";

function ChannelSettings() {
    const [sidebarItem, setSidebarItem] = useState<string>("Users");
    const {channelDatas, currentChannelId} = useAppSelector((state) => state.channel);
    
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {socket} = useContext(SocketContext);
    const channelId: number | undefined = params.channelId ? parseInt(params.channelId!, 10) : undefined;

    useEffect(() => {
        if (socket && currentChannelId !== channelId) {
            if (currentChannelId !== undefined) {
                socket?.emit("LeaveChannelRoom", {
                    id: currentChannelId,
                });
                socket?.off("roomData");
                socket?.off("ChannelUpdate");
                dispatch(unsetChannelDatas());
            }
            if (channelId !== undefined)
                dispatch(setChannelId(channelId));
            else
                dispatch(unsetChannelId());
        } else if (socket && currentChannelId !== undefined && location.pathname !== `/chat/channel/${currentChannelId}` && location.pathname !== `/chat/channel/${currentChannelId}/settings`) {
            socket?.emit("LeaveChannelRoom", {
                id: currentChannelId,
            });
            socket?.off("roomData");
            socket?.off("ChannelUpdate");
            dispatch(unsetChannelDatas());
        }
    }, [channelId, socket, location.pathname]);

    if (!channelDatas) {
        return (
            <div className="channel-setting-container">
                <LoadingSpin />
            </div>
        );
    } else {
        return (
            <div className="channel-setting-container">
                <SidebarSettings setSidebarItem={setSidebarItem} />
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