import { useEffect, useContext, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ChannelsInterfaceFront, Channel } from "../../../Types/Chat-Types";
import SidebarItem from "./Sidebar-Item";
import { SidebarContext } from "../Chat";
import { Link } from "react-router-dom";

function Sidebar(props: {showModal: number, setShowModal: Function, chanDatas: ChannelsInterfaceFront[]}) {
    const {showModal, setShowModal, chanDatas} = props;

    const sidebarStatus = useContext(SidebarContext);
    const ref = useRef<HTMLHeadingElement>(null);
    const params = useParams();
    const location = useLocation();

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target) 
                && sidebarStatus.sidebar && sidebarStatus.setSidebarStatus 
                && (params.chatId !== undefined || location.pathname === "/chat/channels-list")) {
                
                    sidebarStatus.setSidebarStatus();
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [sidebarStatus, sidebarStatus.setSidebarStatus, params.chatId]);

 
    return (
        <div ref={ref} className={`chat-sidebar ${sidebarStatus.sidebar ? "chat-sidebar-responsive" : ""}`}>
            <ul className="ul-wrapper">
                <SidebarItem
                    index={0}
                    title="Channels"
                    datasArray={chanDatas}
                    setShowModal={setShowModal}
                    showModal={showModal}
                />
                {/* <SidebarItem
                    index={1}
                    title="Messages Privées"
                    // datasArray={chanDatas === undefined ? undefined : chanDatas.filter((elem) => !elem.channel.isChannel)}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    chanClick={chanClick}
                /> */}
            </ul>
            <Link className="explore-button" to="/chat/channels-list" onClick={() => sidebarStatus.setSidebarStatus()}>
                Explore other channels
            </Link>
        </div>
    );
}

export default Sidebar;