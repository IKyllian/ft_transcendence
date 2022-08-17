import React, { useState } from "react";

function AddFriendModal() {
    const [inputText, setInputText] = useState<string>("");
    return (
        <div className='add-friend-modal'>
            <div>
                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => setInputText(e.target.value)} />
            </div>
            <div>
                
            </div>
        </div>
    );
}

export default AddFriendModal;