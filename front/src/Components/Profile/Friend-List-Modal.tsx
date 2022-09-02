import { useEffect, useRef } from "react";

function FriendListModal(props: {show: boolean, onClickOutside: Function}) {
    const { show, onClickOutside } = props;

    const ref = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClickOutside && onClickOutside();
            }
        };
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [onClickOutside]);
    
    if (!show) {
        return (null);
    } else {
        return (
            <div ref={ref} className="friend-list-modal">
                <p> Delete friend </p>
                <p> Défier </p>
                <p> Send message </p>
            </div>
        );
    }
}

export default FriendListModal;