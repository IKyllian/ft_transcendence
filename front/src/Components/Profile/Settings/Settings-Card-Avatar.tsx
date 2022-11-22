import { useState } from "react";
import { fetchUploadAvatar } from "../../../Api/Profile/Profile-Fetch";
import Avatar from "../../../Images-Icons/pp.jpg";
import { useAppSelector } from "../../../Redux/Hooks";

function SettingsCardAvatar() {
    const { token } = useAppSelector(state => state.auth);
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
    return (
        <div className="avatar-card">
            <p className="card-username"> Kyllian </p>
            <div className="avatar-form-container">
                <img className='profile-avatar' src={inputFile === undefined ? Avatar : urlFile} alt="profil pic" />
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
    );
}

export default SettingsCardAvatar;