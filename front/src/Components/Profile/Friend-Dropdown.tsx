import { Link } from "react-router-dom";
import { useFriendHook } from "../../Hooks/Friend-Hook";
import DropdownContainer from "../Utils/Dropdown-Container";

function FriendListModal(props: {show: boolean, onClickOutside: Function, userId: number}) {
    const { show, onClickOutside, userId } = props;
    const { handleRemoveFriend } = useFriendHook();
    
    return (
        <DropdownContainer show={show} onClickOutside={onClickOutside} >
            <Link className="send-message-icon" to="/chat" state={{userIdToSend: userId}}>
                <p> Send Message </p>
            </Link>
            <p className="red-item" onClick={() => handleRemoveFriend(userId)}> Delete friend </p>
        </DropdownContainer>
    );
}

export default FriendListModal;