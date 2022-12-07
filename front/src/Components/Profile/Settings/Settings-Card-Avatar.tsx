import { IconUpload } from "@tabler/icons";
import { useContext, useState } from "react";
import { fetchUploadAvatar } from "../../../Api/Profile/Profile-Fetch";
import { CacheContext } from "../../../App";
import { baseUrl } from "../../../env";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { setUserAvatar } from "../../../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import ExternalImage from "../../External-Image";

function SettingsCardAvatar() {
    const { token, currentUser } = useAppSelector(state => state.auth);
    const [inputFile, setInputFile] = useState<File | undefined>(undefined);
    const [urlFile, setUrlFile] = useState<string>("");
    const {cache} = useContext(CacheContext);
    const dispatch = useAppDispatch();

    const onSubmit = async (e: any) => {
        e?.preventDefault();
        if (inputFile) {
            let formData = new FormData();
            formData.append("image", inputFile);
            fetchUploadAvatar(token, formData).then(async (response) => {
                console.log("Response Upload", response);
                if (cache && currentUser) {
                    const req = new Request(`${baseUrl}/users/${currentUser.id}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${token}`}});
                    if (!response.ok)
                        dispatch(addAlert({message: "Failed To Upload", type: AlertType.ERROR}));
                    else {
                        cache.put(req, response.clone());
                        const avatarBlob = await response.blob();
                        if (avatarBlob)
                            dispatch(setUserAvatar(URL.createObjectURL(avatarBlob)));    
                        dispatch(addAlert({message: "New Avatar Uploaded", type: AlertType.SUCCESS}));
                    }
                }  
            })  
            .catch(err => {
                dispatch(addAlert({message: "Failed To Upload", type: AlertType.ERROR}));
                console.log(err);
            })
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
                        <IconUpload />
                        Upload
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