import { useContext } from "react";
import { Link } from "react-router-dom";

import { ChannelsInterfaceFront } from "../../../Types/Chat-Types";
import { SidebarContext } from '../Chat';

interface Props {
    datasArray?: ChannelsInterfaceFront[],
}

function ItemContent(props: Props) {
    const {datasArray} = props;
    const sidebarStatus = useContext(SidebarContext);
    return (
        <ul className="ul-collapse">
            {
                datasArray && datasArray.map((elem) => 
                    <Link className="list-item-container" key={elem.channel.id} to={`/chat/${elem.channel.id}`} onClick={() => sidebarStatus.setSidebarStatus()}>
                        <li is-target={elem.isActive}>
                            # {elem.channel.name}
                            {/* {elem.channel.isChannel && "# "}
                            {elem.channel.isChannel ? elem.channel.channelName : elem.channel.users[0].username} */}
                        </li>
                    </Link>
                )
            }
        </ul>
    );
}

export default ItemContent;