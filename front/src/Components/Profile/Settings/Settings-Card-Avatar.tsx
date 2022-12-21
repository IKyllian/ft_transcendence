import { IconUpload } from "@tabler/icons";
import { useContext, useState } from "react";
import { fetchUploadAvatar } from "../../../Api/Profile/Profile-Fetch";
import { CacheContext } from "../../../App";
import { addAlert, AlertType } from "../../../Redux/AlertSlice";
import { setUserAvatar } from "../../../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { TokenStorageInterface } from "../../../Types/Utils-Types";
import { createdAccountDate } from "../../../Utils/Utils-User";
import ExternalImage from "../../External-Image";

function SettingsCardAvatar() {
    const { currentUser } = useAppSelector(state => state.auth);
    const [inputFile, setInputFile] = useState<File | undefined>(undefined);
    const [fileError, setFileError] = useState<string | undefined>();
    const [urlFile, setUrlFile] = useState<string>("");
    const {cache} = useContext(CacheContext);
    const dispatch = useAppDispatch();

    const onSubmit = async (e: any) => {
        e?.preventDefault();
        const localToken: string | null = localStorage.getItem("userToken");			
        if (localToken !== null && inputFile) {
            const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
            let formData = new FormData();
            
            formData.append("image", inputFile);
            fetchUploadAvatar(localTokenParse.access_token, formData).then(async (response) => {
				if (currentUser) {
					const req = new Request(`${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}/avatar`, {method: 'GET', headers: {"Authorization": `Bearer ${localTokenParse.access_token}`}});
                    if (!response.ok) {
                        dispatch(addAlert({message: "Failed To Upload", type: AlertType.ERROR}));
                    }
                    else {
						if (cache)
                        	cache.put(req, response.clone());
                        const avatarBlob = await response.blob();
                        if (avatarBlob)
                            dispatch(setUserAvatar(URL.createObjectURL(avatarBlob))); 
                        dispatch(addAlert({message: "New Avatar Uploaded (Refresh to see it)", type: AlertType.SUCCESS}));
                    }
                }
            })  
            .catch(err => {
                dispatch(addAlert({message: "Failed To Upload", type: AlertType.ERROR}));
                console.log(err);
            })
        }
    }

    const onFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            var filesize: string = ((file.size/1024)/1024).toFixed(4);
            if (+filesize < 10) {
                if (fileError)
                    setFileError(undefined);
                setInputFile(file);
                setUrlFile(URL.createObjectURL(file));
            } else {
                setFileError("File is too big. File size must be under 10 Mo");
            }
        }
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
                { inputFile === undefined && <ExternalImage src={currentUser.avatar} alt="User Avatar" className='profile-avatar' userId={currentUser.id} /> }
                { inputFile && <img className='profile-avatar' src={urlFile} alt="New Avatar" />  }
                { fileError && <p className="error-file"> {fileError} </p> }
                <form id="avatar-form" onReset={() => resetUpload()} onSubmit={(e) => onSubmit(e)}>
                    <label>
                        <IconUpload />
                        Upload
                        <input type="file" onChange={(e) => onFileChange(e)} accept="image/gif, image/jpg, image/jpeg, image/png" />
                    </label>
                    <div className="buttons-container">
                        <button type="reset"> Reset </button>
                        <button type='submit'> Save </button>
                    </div>
                </form>
            </div>
            <p className="member-txt"> Member Since: <span> {createdAccountDate(currentUser.created_at)} </span> </p>
        </div>
    ) : (
        <> </>
    );
}

export default SettingsCardAvatar;