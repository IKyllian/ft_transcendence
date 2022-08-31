import SearchBarPlayers from "../SearchBarPlayers";

import { IconX } from '@tabler/icons';

function ChatModal(props: {setShowModal: Function, showModal: number}) {
    const { setShowModal, showModal } = props;
    
    if (showModal === 1) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => setShowModal(false) } />
                <form>
                    <label>
                        Channel name:
                        <input type="text" name="name" placeholder="Channel name..." />
                    </label>
                    <label>
                        Password (optional):
                        <input type="password" name="password" placeholder="(optional)" />
                    </label>
                    <SearchBarPlayers functionality="chanInvite" />
                    <div className="chat-modal-buttons">
                        <button onClick={() => setShowModal(false) }> Cancel </button>
                        <input type="submit" name="Save" />
                    </div>
                </form>
            </div>        
        );
    } else if (showModal === 2) {
        return (
            <div className="chat-modal">
                <IconX className="modal-exit" onClick={() => setShowModal(false) } />
                <SearchBarPlayers functionality="sendMessage" />
            </div>
        );
    } else {
        return (
            <> </>
        );
    }
}

export default ChatModal;