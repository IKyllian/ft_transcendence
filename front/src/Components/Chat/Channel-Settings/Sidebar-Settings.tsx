import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../../Redux/Hooks'
import { SocketContext } from "../../../App";
import { useContext, useEffect, useState } from "react";
import { removeChannel } from "../../../Redux/ChatSlice";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";
import { getWindowDimensions } from "../../../Utils/Utils-Chat";

function SidebarSettings(props: {setSidebarItem: Function}) {
    const {setSidebarItem} = props;
    const {channelDatas, loggedUserIsOwner, loggedUserIsModerator} = useAppSelector((state) => state.channel);
    const [showSidebar, setShowSidebar] = useState<boolean>(true);

    const params = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {socket} = useContext(SocketContext);

    const leaveChannel = () => {
        if (params.channelId) {
            const chanId: number = +params.channelId;
            socket?.emit("LeaveChannel", {chanId: chanId});
            dispatch(removeChannel(chanId));
        }
    }

    if (!channelDatas)
        navigate("/chat");

    useEffect(() => {
        function handleResize() {
            const width = getWindowDimensions().width;
            if (width >= 800)
                setShowSidebar(prev => !prev ? true : prev);
        }
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    return showSidebar ? (
        <div className="sidebar-setting">
            <div style={{left: '230px'}} className="sidebar-button" onClick={() => setShowSidebar(prev => !prev)}>
                { showSidebar && <IconChevronLeft />}
                { !showSidebar && <IconChevronRight />}
            </div>
            <div  className="sidebar-wrapper">
                <p> # {channelDatas!.name} </p>
                <ul>
                    {loggedUserIsOwner && <li onClick={() => setSidebarItem("Settings")}> Settings </li>}
                    <li onClick={() => setSidebarItem("Users")}> Users ({channelDatas!.channelUsers.length}) </li>
                    {(loggedUserIsOwner || loggedUserIsModerator) && <li onClick={() => setSidebarItem("Invitations")}> Banned User </li>}
                </ul>
                <div className="separate-line"> </div>
                <button onClick={() => leaveChannel()}> Leave Channel </button>
            </div>
        </div>
    ) : (
        <div style={{left: '-18px'}} className="sidebar-button" onClick={() => setShowSidebar(prev => !prev)}>
            { showSidebar && <IconChevronLeft />}
            { !showSidebar && <IconChevronRight />}
        </div>
    );
}

export default SidebarSettings;