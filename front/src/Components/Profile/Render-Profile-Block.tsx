import BlockMatchHistory from "./Blocks/Block-Match-History";
import BlockAchievement from "./Blocks/Block-Achievement";
import BlockFriends from "./Blocks/Block-Friends";

import { MatchResult, UserInterface } from "../../Types/User-Types";

function RenderProfileBlock(props: {blockTitle: string, userDatas: UserInterface, friendList: UserInterface[], matchHistory: MatchResult[]}) {
    const {blockTitle, userDatas, friendList, matchHistory} = props;

    if (blockTitle === "Achievements") {
        return (
            <BlockAchievement />
        );
    } else if (blockTitle === "Matches") {
        return (
            <BlockMatchHistory matchHistory={matchHistory} />
        );
    } else {
        return (
           <BlockFriends friendList={friendList} userProfileId={userDatas.id} />
        );
    }
}

export default RenderProfileBlock;