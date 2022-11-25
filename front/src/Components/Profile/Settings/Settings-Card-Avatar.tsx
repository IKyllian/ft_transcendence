import { useState } from "react";
import { fetchUploadAvatar } from "../../../Api/Profile/Profile-Fetch";
import Avatar from "../../../Images-Icons/pp.jpg";
import { useAppSelector } from "../../../Redux/Hooks";
import ExternalImage from "../../External-Image";

function SettingsCardAvatar() {
    const { token, currentUser } = useAppSelector(state => state.auth);
    const [inputFile, setInputFile] = useState<File | undefined>(undefined);
    const [urlFile, setUrlFile] = useState<string>("");

    const onSubmit = (e: any) => {
        e?.preventDefault();
        if (inputFile) {
            let formData = new FormData();
            formData.append("image", inputFile);
            fetchUploadAvatar(token, formData);
        }
    }
    
    const onFileChange = (e: any) => {
        setInputFile(e.target.files[0]);
        setUrlFile(URL.createObjectURL(e.target.files[0]));
    }

    const resetUpload = () => {
        if (inputFile) {
            URL.revokeObjectURL(urlFile);
            setUrlFile("");
            setInputFile(undefined)
        }
    }
    return currentUser ? (
        <div className="avatar-card">
            <p className="card-username"> {currentUser?.username} </p>
            <div className="avatar-form-container">
                {inputFile === undefined && <ExternalImage src={currentUser.avatar} alt="User Avatar" className='profile-avatar' userId={currentUser.id} /> }
                {inputFile && <img className='profile-avatar' src={urlFile} alt="New Avatar" />  }
                <form onSubmit={(e) => onSubmit(e)}>
                    <label>
                        Upload New Avatar
                        <input type="file" onChange={(e) => onFileChange(e)} />
                    </label>
                    <div className="buttons-container">
                        <button onClick={() => resetUpload()} > Reset </button>
                        <button type='submit'> Save </button>
                    </div>
                </form>
            </div>
            <p className="member-txt"> Member Since: <span> 12 Novembre 2022 </span> </p>
        </div>
    ) : (
        <> </>
    );
}

export default SettingsCardAvatar;