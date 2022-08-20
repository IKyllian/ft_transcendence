import React, { useState } from "react";

import {IconChevronDown, IconPlus, IconChevronRight} from "@tabler/icons";

function SidebarItem(props: any) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    const {title} = props;

    const handleClick = () => {
        if (sidebarOpen)
            setSidebarOpen(false);
        else
            setSidebarOpen(true);
    }
    return (
        <li className="ul-wrapper-elem-1">
            <div className="collapse-button">
                <div className="collapse-button-name">
                    {
                        sidebarOpen ? <IconChevronDown onClick={handleClick} /> : <IconChevronRight onClick={handleClick} />
                    }
                    <p> {title} </p>
                </div>
                <IconPlus className="plus-icon" />
            </div>
            {
                sidebarOpen &&
                <ul className="ul-collapse">
                    <li> # Général </li>
                    <li> # Conv 1 </li>
                    <li> # Random </li>
                </ul>
            }
        </li>
    );
}

export default SidebarItem;