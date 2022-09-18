import { useContext } from "react";
import { Link } from "react-router-dom";

import { IconUser, IconPlus } from "@tabler/icons";
import { ChannelsInterfaceFront } from "../../../Types/Chat-Types";
import { ChatInterface } from "../../../Types/Datas-Examples";
import { SidebarContext } from '../Chat';

interface Props {
    datasArray?: ChannelsInterfaceFront[],
    publicChanArray?: ChatInterface[],
    chanClick?: Function,
}

function ItemContent(props: Props) {
    const {datasArray, publicChanArray, chanClick} = props;
    const sidebarStatus = useContext(SidebarContext);
    return (
        <ul className="ul-collapse">
            {
                datasArray && datasArray.map((elem) => 
                    <Link className="list-item-container" key={elem.channel.id} to={`/chat/${elem.channel.id}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                        <li onClick={() => chanClick!(elem.channel.id)} is-target={elem.isActive}>
                            {elem.channel.isChannel && "# "}
                            {elem.channel.isChannel ? elem.channel.channelName : elem.channel.users[0].username}
                        </li>
                    </Link>
                )
            }
            {
                publicChanArray && publicChanArray.map((elem) => 
                    <div key={elem.id} className="list-item-container">
                        <li key={elem.id} className="public-chan-item">
                            # {elem.isChannel ? elem.channelName : elem.users[0].username}
                            <div className="icon-container">
                                <IconUser />
                                <span> {elem.users.length} </span>
                                <IconPlus />
                            </div>
                        </li>
                    </div>
                )
            }
        </ul>
    );
}

export default ItemContent;