import { useState } from "react";

import { ChannelsInterfaceFront } from "../../../Types/Chat-Types";
import ItemHeader from "./Item-Header";
import ItemContent from "./Item-Content";

interface SidebarItemProps {
    index: number,
    title: string,
    datasArray?: ChannelsInterfaceFront[],
    setShowModal?: Function,
    showModal?: number,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const {index, title, datasArray, setShowModal, showModal} = props;

    const handleClick = () => {
        setSidebarOpen(!sidebarOpen);
    }

    const modalStatus = () => {
            setShowModal!(index === 0 ? 1 : 0);
    }

    return (
        <li className="ul-wrapper-elem">
            {datasArray && <ItemHeader title={title} sidebarOpen={sidebarOpen} handleClick={handleClick} modalStatus={modalStatus} />}            
            {
               datasArray !== undefined && sidebarOpen && 
               <ItemContent datasArray={datasArray} />
            }
        </li>
    );
}

export default SidebarItem;