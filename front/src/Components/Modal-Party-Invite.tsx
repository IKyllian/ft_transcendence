import SearchBarPlayers from "./Search-Bar/SearchBarPlayers";
import { IconX } from "@tabler/icons";
import { fetchSearchAllUsers } from "../Api/User-Fetch";
import { SearchBarFunctionality } from "../Types/Utils-Types";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { changeModalStatus } from "../Redux/PartySlice";

function ModalPartyInvite() {
    const { modalIsOpen } = useAppSelector(state => state.party);
    const dispatch = useAppDispatch();
    return modalIsOpen ? (
        <div className="chat-modal">
            <IconX className="modal-exit" onClick={() => dispatch(changeModalStatus(false)) } />
            <SearchBarPlayers functionality={SearchBarFunctionality.PARTY_INVITE} fetchUserFunction={fetchSearchAllUsers} />
        </div>
    ): (
        <></>
    );
}

export default ModalPartyInvite;