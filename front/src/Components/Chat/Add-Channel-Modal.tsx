import SearchPlayerInput from "../SearchPlayerInput";

import { IconX } from '@tabler/icons';

function AddChannelModal(props: {setShowModal: Function, show: boolean}) {
    const { setShowModal, show } = props;
    if (show) {
        return (
            <div className="add-channel-modal">
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
                    <SearchPlayerInput />
                    <div className="add-channel-modal-buttons">
                        <button onClick={() => setShowModal(false) }> Cancel </button>
                        <input type="submit" name="Save" />
                    </div>
                </form>
            </div>        
        );
    } else {
        return (
            <> </>
        );
    }
}

export default AddChannelModal;