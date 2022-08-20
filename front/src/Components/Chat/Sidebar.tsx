import React from "react";

import SidebarItem from "./Sidebar-Item";

function Sidebar() {
    return (
        <div className="chat-sidebar">
            <ul className="ul-wrapper"> 
                <SidebarItem title="Channels" />
                <SidebarItem title="Messages Privées" />
            </ul>
        </div>
    );
}

export default Sidebar;