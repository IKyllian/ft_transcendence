import { ReactNode, useEffect, useRef } from "react";

function DropdownContainer(props: {show: boolean, onClickOutside: Function, children?: ReactNode, alignToLeft?: boolean}) {
    const { show, onClickOutside, children, alignToLeft } = props;

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

    return show ? (
        <div ref={ref} className="dropdown-container" style={alignToLeft ? {left: '-150px', top: '30px'} : {left: '20px', top: '30px'}} >
            <div className="dropdown-wrapper">
                {children}
            </div>
        </div>
    ) : (
        <> </>
    );
}

export default DropdownContainer;