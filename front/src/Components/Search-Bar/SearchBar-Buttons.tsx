import { IconCheck, IconX } from "@tabler/icons";
import { UserInterface, UsersListInterface } from "../../Types/User-Types";
import { useFriendHook } from "../../Hooks/Friend-Hook";
import { SearchBarButtonsProps } from "../../Types/Utils-Types";

function SearchBarButtons(props: SearchBarButtonsProps) {
    const { functionality, user, checkboxOnChange, checkboxArray, handleSendMessage, userFromList} = props;

    const {
        handleAddFriend,
        replieFriendRequest,
    } = useFriendHook();
   
    if (functionality === "addFriend") {
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
    } else if (functionality === "chanInviteOnCreate" || functionality === "chanInvite") {
        return (
            <input
                type="checkbox"
                value={user?.id}
                onChange={() => checkboxOnChange!(user)}
                checked={checkboxArray && checkboxArray.find((val : UserInterface) => val.id === user?.id) ? true : false}
            />
        );
    } else {
        return (
            <button onClick={() => handleSendMessage!()}> Send message </button>
        );
    }
}

export default SearchBarButtons;