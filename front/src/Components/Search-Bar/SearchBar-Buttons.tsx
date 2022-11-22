import { IconCheck, IconX } from "@tabler/icons";
import { UserInterface, UsersListInterface } from "../../Types/User-Types";
import { useFriendHook } from "../../Hooks/Friend-Hook";
import { SearchBarButtonsProps } from "../../Types/Utils-Types";
import { SearchBarFunctionality } from "../../Types/Utils-Types";
import { useContext } from "react";
import { SocketContext } from "../../App";

function SearchBarButtons(props: SearchBarButtonsProps) {
    const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage, userFromList} = props;

    const {socket} = useContext(SocketContext);
    const {
        handleAddFriend,
        replieFriendRequest,
    } = useFriendHook();

    const onPartyInvite = () => {
        console.log("TEST");
        console.log("ID", user?.id)
        socket?.emit("PartyInvite", {
            id: user?.id,
        });
    }
   
    if (functionality === SearchBarFunctionality.ADD_FRIEND) {
        if (userFromList?.relationStatus === "none") {
            return (<button onClick={() => handleAddFriend(userFromList!.user.id)}> Add friend </button>);
        } else if (userFromList?.relationStatus === "pending") {
            return (<p> pending </p>);
        } else {
            return (
                <div className="friendship-action-wrapper">
                    <IconCheck onClick={() => replieFriendRequest(userFromList!.user.id, "accepted")} />
                    <IconX onClick={() => replieFriendRequest(userFromList!.user.id, "declined")} />
                </div>
            )
        }
    } else if (functionality === SearchBarFunctionality.CHAN_INVITE_ON_CREATE || functionality === SearchBarFunctionality.CHAN_INVITE) {
        return (
            <input
                type="checkbox"
                value={user?.id}
                onChange={() => checkboxOnChange!(user)}
                checked={checkboxArray && checkboxArray.find((val : UserInterface) => val.id === user?.id) ? true : false}
            />
        );
    } else if (functionality === SearchBarFunctionality.SEND_MESSAGE) {
        return (
            <button onClick={() => handleSendMessage!()}> Send message </button>
        );
    } else {
        return (
            <button onClick={() => onPartyInvite()}> Invite to party </button>
        );
    }
}

export default SearchBarButtons;