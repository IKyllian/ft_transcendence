import { ReactNode, useEffect, useRef, useState } from "react";

function DropdownContainer(props: {show: boolean, onClickOutside: Function, children?: ReactNode, alignToLeft?: boolean}) {
    const { show, onClickOutside, children, alignToLeft } = props;
    const [mouseY, setMouseY] = useState<number>(0);
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

    if (alignToLeft) {
        useEffect(() => {
            const diffMouse: number = 100; // Diff between y mouse pos and page height
            const spaceValue: number = 150; // Remove 100 (👆 this value) + 50 to place the element
            const dropdownHeight: number = 160; // Height of the dropdown element
            const handleWindowMouseMove = (event: any) => {
                if (!show) {
                    if ((event.screenY - diffMouse) + dropdownHeight < window.innerHeight)
                        setMouseY(event.screenY - spaceValue);
                    else {
                        const diff = ((event.screenY - diffMouse) + dropdownHeight) - window.innerHeight;
                        setMouseY(((event.screenY - diffMouse) - diff) - spaceValue);
                    }
                }
            };
            window.addEventListener('mousemove', handleWindowMouseMove);
        
            return () => {
              window.removeEventListener('mousemove', handleWindowMouseMove);
            };
        }, [show]);
    }

    return show ? (
        <div ref={ref} className="dropdown-container" style={alignToLeft ? {left: '-150px', top: mouseY} : {left: '20px', top: '30px'}} >
            <div className="dropdown-wrapper">
                {children}
            </div>
        </div>
    ) : (
        <> </>
    );
}

export default DropdownContainer;