import { useContext, useEffect, useState } from "react";
import { getPlayerAvatar } from "../Api/User-Fetch";
import { CacheContext } from "../App";
import DefaultAvatar from "../Assets/default-avatar.jpg";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";
import { addStoreAvatar, StoreAvatarInterface } from "../Redux/StoreAvatar";
import { TokenStorageInterface } from "../Types/Utils-Types";

interface Props {
    src: string | null,
    alt: string,
    className: string,
    userId: number,
}

function ExternalImage(props: Props) {
    const {src, alt, className, userId} = props;
    const [loaded, setLoaded] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined | null>(undefined);
    const {cache} = useContext(CacheContext);
    const dispatch = useAppDispatch();
    const {avatarsStored} = useAppSelector(state => state.avatarStored);

    const onLoad = () => {
        setLoaded(true);
    }

    useEffect(() => {
        const searchAvatar: undefined | StoreAvatarInterface = avatarsStored.find(elem => elem.id === userId);
        if (searchAvatar) {
            setAvatarUrl(searchAvatar.url);
        } else {
            if (cache !== undefined) {
                const getAvatar = async () => {
                    if (cache !== undefined && src) {
                        const localToken: string | null = localStorage.getItem("userToken");
                        if (localToken !== null) {
                            const localTokenParse: TokenStorageInterface = JSON.parse(localToken);
                            let result: string | undefined =  await getPlayerAvatar(cache, localTokenParse.access_token, userId, src);
                            if (result) {
                                setAvatarUrl(result);
                                dispatch(addStoreAvatar({id: userId, url: result}));
                            }
                            else
                                setAvatarUrl(null);
                        }
                    }
                }
                if (src === null) {
                    setAvatarUrl(null);
                } else {
                    getAvatar();
                }
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