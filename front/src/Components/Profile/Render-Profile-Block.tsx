import BlockMatchHistory from "./Blocks/Block-Match-History";
import BlockAchievement from "./Blocks/Block-Achievement";
import BlockFriends from "./Blocks/Block-Friends";

import { UserInterface } from "../../Types/User-Types";

function RenderProfileBlock(props: {blockTitle: string, userDatas: UserInterface}) {
    const {blockTitle, userDatas} = props;

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
           <BlockFriends userDatas={userDatas} />
        );
    }
}

export default RenderProfileBlock;