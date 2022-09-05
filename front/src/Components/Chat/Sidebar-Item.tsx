import { useState } from "react";
import { Link } from "react-router-dom"

import { IconChevronDown, IconPlus, IconChevronRight } from "@tabler/icons";
import { ChannelsInterfaceFront } from "../../Interfaces/Interface-Chat";

interface SidebarItemProps {
    index: number,
    title: string,
    datasArray: ChannelsInterfaceFront[] | undefined,
    setShowModal: Function,
    showModal: number,
    chanClick: Function,
}

function SidebarItem(props: SidebarItemProps) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    const {index, title, datasArray, setShowModal, showModal, chanClick} = props;

    const handleClick = () => {
        if (sidebarOpen)
            setSidebarOpen(false);
        else
            setSidebarOpen(true);
    }

    const modalStatus = () => {
        if (showModal > 0)
            setShowModal(0);
        else
            setShowModal(index === 0 ? 1 : 2);
    }

    return (
        <li className="ul-wrapper-elem">
            <div className="collapse-button">
                <div className="collapse-button-name">
                    {
                        sidebarOpen ? <IconChevronDown onClick={handleClick} /> : <IconChevronRight onClick={handleClick} />
                    }
                    <p> {title} </p>
                </div>
                <IconPlus className="plus-icon" onClick={modalStatus} />
            </div>
            {
               datasArray !== undefined && sidebarOpen && 
               <ul className="ul-collapse">
                    {
                        datasArray.map((elem) => {
                            if ("channelName" in elem.channel) {
                                return (
                                    <Link key={elem.channel.id} to={`/chat/${elem.channel.id}`}>
                                        <li onClick={() => chanClick(elem.channel.id)} is-target={elem.isActive}>
                                            # {elem.channel.channelName}
                                        </li>
                                    </Link>
                                );
                            } else {
                                return (
                                    <Link key={elem.channel.id} to={`/chat/${elem.channel.id}`}>
                                        <li onClick={() => chanClick(elem.channel.id)} is-target={elem.isActive}>
                                            {elem.channel.user.name }
                                        </li>
                                    </Link>
                                );
                            }
                        })
                    }
                </ul>
            } 
        </li>
    );
}

export default SidebarItem;