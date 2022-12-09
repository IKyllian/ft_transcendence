import { useContext, useEffect, useState } from "react";
import { getPlayerAvatar } from "../Api/User-Fetch";
import { CacheContext } from "../App";
import DefaultAvatar from "../Images-Icons/pp.jpg";
import { setUserAvatar } from "../Redux/AuthSlice";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { TokenStorageInterface } from "../Types/Utils-Types";

function ExternalImage(props: {src: string | null, alt: string, className: string, userId: number}) {
    const {src, alt, className, userId} = props;
    const [loaded, setLoaded] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined | null>(undefined);
    const {cache} = useContext(CacheContext);
    const {loggedUserAvatar, currentUser} = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const onLoad = () => {
        setLoaded(true);
    }

    useEffect(() => {
        if (cache !== undefined) {
            const getAvatar = async () => {
                if (cache !== undefined && src) {
                    if (currentUser?.id === userId && loggedUserAvatar !== undefined)
                        setAvatarUrl(loggedUserAvatar);
                    else {
                        const localToken: string | null = localStorage.getItem("userToken");
                        if (localToken !== null) {
                            const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
                            let result: string | undefined =  await getPlayerAvatar(cache, localTokenParse.access_token, userId, src);
                            if (result) {
                                if (currentUser?.id === userId && loggedUserAvatar == undefined)
                                    dispatch(setUserAvatar(result));
                                setAvatarUrl(result);
                            }
                            else
                                setAvatarUrl(null);
                        }
                    }
                }
            }
            if (src === null) {
                setAvatarUrl(null);
            } else {
                getAvatar();
            }
        }
    }, [cache]);

    return avatarUrl !== undefined ? (
        <>
            <img
                className={className}
                style={{display: loaded ? 'block' : 'none'}}
                onLoad={onLoad}
                src={avatarUrl !== null && avatarUrl !== undefined ? avatarUrl : DefaultAvatar}
                alt={alt}
            />
            {!loaded && <span className="loader-image"></span> }
        </>
    ) : (
        <span className="loader-image"></span>
    );
}

export default ExternalImage;