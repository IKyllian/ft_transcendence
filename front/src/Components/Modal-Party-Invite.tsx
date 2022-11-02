import SearchBarPlayers from "./Search-Bar/SearchBarPlayers";
import { IconX } from "@tabler/icons";
import { fetchSearchAllUsers } from "../Api/User-Fetch";
import { SearchBarFunctionality } from "../Types/Utils-Types";

function ModalPartyInvite(props: {show: boolean, onCloseModal: Function}) {
    const { show, onCloseModal } = props;
    return show ? (
        <div className="chat-modal">
            <IconX className="modal-exit" onClick={() => onCloseModal() } />
            <SearchBarPlayers functionality={SearchBarFunctionality.PARTY_INVITE} fetchUserFunction={fetchSearchAllUsers} />
        </div>
    ): (
        <></>
    );
}

export default ModalPartyInvite;