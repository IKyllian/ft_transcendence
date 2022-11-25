import { useContext, useEffect, useState } from "react";
import { CacheContext } from "../App";
import DefaultAvatar from "../Images-Icons/pp.jpg";
import { useAppSelector } from "../Redux/Hooks";
import { getPlayerAvatar } from "../Utils/Utils-User";

function ExternalImage(props: {src: string | null, alt: string, className: string, userId: number}) {
    const {src, alt, className, userId} = props;
    const [loaded, setLoaded] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined | null>(undefined);
    const {cache} = useContext(CacheContext);
    const {token} = useAppSelector(state => state.auth);
    const onLoad = () => {
        setLoaded(true);
    }
    useEffect(() => {
        const getAvatar = async () => {
            if (cache) {
                const result: string | undefined =  await getPlayerAvatar(cache, token, userId);
                if (result)
                    setAvatarUrl(result);
                else
                    setAvatarUrl(null);
            }
        }
        if (src === null)
            setAvatarUrl(null);
        else {
            getAvatar();
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