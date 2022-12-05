import { IconUpload } from "@tabler/icons";
import { useContext, useState } from "react";
import { fetchUploadAvatar } from "../../../Api/Profile/Profile-Fetch";
import { CacheContext } from "../../../App";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { setUserAvatar } from "../../../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { updatePlayerAvatar } from "../../../Utils/Utils-User";
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
            fetchUploadAvatar(token, formData);
            if (cache && currentUser) {
                const newUrl: string | undefined = await updatePlayerAvatar(cache, token, currentUser?.id);
                console.log("newUrl", newUrl);
                if (newUrl)
                    dispatch(setUserAvatar(newUrl));
            }
            dispatch(addAlert({message: "New Avatar Uploaded", type: AlertType.SUCCESS}));
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
                        {/* <button>  Upload </button> */}
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