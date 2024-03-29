import { useEffect, useContext, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ChannelsInterfaceFront, ConversationInterfaceFront } from "../../../Types/Chat-Types";
import SidebarItem from "./Sidebar-Item";
import { SidebarContext } from "../Chat";
import { Link } from "react-router-dom";

function Sidebar(props: {setShowModal: Function, chanDatas: ChannelsInterfaceFront[], privateConvs: ConversationInterfaceFront[]}) {
    const {setShowModal, chanDatas, privateConvs} = props;

    const sidebarStatus = useContext(SidebarContext);
    const ref = useRef<HTMLHeadingElement>(null);
    const params = useParams();
    const location = useLocation();

    const channelId: number | undefined = params.channelId ? +params.channelId! : undefined;
    const convId: number | undefined = params.convId ? +params.convId! : undefined;

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                sidebarStatus.sidebar && sidebarStatus.setSidebarStatus
                && ((channelId !== undefined || convId !== undefined) || (!channelId && !convId && location.pathname === "/chat/channels-list"))
                && sidebarStatus.setSidebarStatus();
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [sidebarStatus, sidebarStatus.setSidebarStatus, channelId, convId, location.pathname]);
 
    return (
        <div ref={ref} className={`chat-sidebar ${sidebarStatus.sidebar ? "chat-sidebar-responsive" : ""}`}>
            <ul className="ul-wrapper">
                <SidebarItem
                    title="Channels"
                    chanDatas={chanDatas}
                    setShowModal={() => setShowModal(1)}
                />
                <SidebarItem
                    title="Messages Privées"
                    privateConvs={privateConvs}
                    setShowModal={() => setShowModal(2)}
                />
            </ul>
            <Link className="explore-button" to="/chat/channels-list" onClick={() => sidebarStatus.setSidebarStatus()}>
                Explore other channels
            </Link>
        </div>
    );
}

export default Sidebar;