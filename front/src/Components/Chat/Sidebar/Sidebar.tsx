import { useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { ChannelsInterfaceFront, ConversationInterfaceFront } from "../../../Types/Chat-Types";
import SidebarItem from "./Sidebar-Item";
import { SidebarContext } from "../Chat";
import { Link } from "react-router-dom";

function Sidebar(props: {setShowModal: Function, chanDatas: ChannelsInterfaceFront[], privateConvs: ConversationInterfaceFront[]}) {
    const {setShowModal, chanDatas, privateConvs} = props;

    const sidebarStatus = useContext(SidebarContext);
    const ref = useRef<HTMLHeadingElement>(null);
    const params = useParams();

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                sidebarStatus.sidebar && sidebarStatus.setSidebarStatus 
                && sidebarStatus.setSidebarStatus();
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [sidebarStatus, sidebarStatus.setSidebarStatus, params.channelId, params.convId]);

 
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