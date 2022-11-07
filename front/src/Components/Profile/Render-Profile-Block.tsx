import BlockMatchHistory from "./Blocks/Block-Match-History";
import BlockAchievement from "./Blocks/Block-Achievement";
import BlockFriends from "./Blocks/Block-Friends";

import { UserInterface } from "../../Types/User-Types";

function RenderProfileBlock(props: {blockTitle: string, userDatas: UserInterface, friendList: UserInterface[]}) {
    const {blockTitle, userDatas, friendList} = props;

    if (blockTitle === "Achievements") {
        return (
            <BlockAchievement />
        );
    } else if (blockTitle === "Matches") {
        return (
            <BlockMatchHistory userDatas={userDatas} />
        );
    } else {
        return (
           <BlockFriends friendList={friendList} />
        );
    }
}

export default RenderProfileBlock;