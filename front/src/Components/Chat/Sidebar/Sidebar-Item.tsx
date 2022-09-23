import { useState } from "react";

import { ChannelsInterfaceFront } from "../../../Types/Chat-Types";
import { ChatInterface } from "../../../Types/Datas-Examples";
import ItemHeader from "./Item-Header";
import ItemContent from "./Item-Content";

interface SidebarItemProps {
    index: number,
    title: string,
    datasArray?: ChannelsInterfaceFront[],
    publicChanArray?: ChatInterface[],
    setShowModal?: Function,
    showModal?: number,
    chanClick?: Function,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    const {index, title, datasArray, publicChanArray, setShowModal, showModal, chanClick} = props;

    const handleClick = () => {
        setSidebarOpen(!sidebarOpen);
    }

    const modalStatus = () => {
        if (showModal! > 0)
            setShowModal!(0);
        else
            setShowModal!(index === 0 ? 1 : 2);
    }

    return (
        <li className="ul-wrapper-elem">
            {datasArray && <ItemHeader title={title} publicItem={false} sidebarOpen={sidebarOpen} handleClick={handleClick} modalStatus={modalStatus} />}
            {publicChanArray && <ItemHeader title={title} publicItem={true} sidebarOpen={sidebarOpen} handleClick={handleClick} />}
            
            {
               datasArray !== undefined && sidebarOpen && 
               <ItemContent datasArray={datasArray} chanClick={chanClick!} />
            }
            {
               publicChanArray !== undefined && sidebarOpen && 
               <ItemContent publicChanArray={publicChanArray} />
            }
        </li>
    );
}

export default SidebarItem;