import BlockMatchHistory from "./Blocks/Block-Match-History";
import BlockAchievement from "./Blocks/Block-Achievement";
import BlockFriends from "./Blocks/Block-Friends";

function RenderProfileBlock(props: {blockTitle: string}) {
    const {blockTitle} = props;

    if (blockTitle === "Achievements") {
        return (
            <BlockAchievement />
        );
    } else if (blockTitle === "Matches") {
        return (
            <BlockMatchHistory />
        );
    } else {
        return (
           <BlockFriends />
        );
    }
}

export default RenderProfileBlock;