import { createContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ModalState } from "../../Types/Modal-Types";

const initialState: ModalState = {
    isOpen: false,
    blurClass: "blur-background",
}

interface Props {
    children?: ReactNode,
}

const ModalContext = createContext({modal: initialState, setStatus: () => {}});

function ModalProvider({ children }: Props) {
    const [state, setState] = useState<ModalState>(initialState);
    const location = useLocation();

    const changeStatus = () => {
        setState({...state, isOpen: !state.isOpen});
    }

    useEffect(() => {
        if (state.isOpen)
            changeStatus();
    }, [location.pathname])

    return (
        <ModalContext.Provider value={{modal: state, setStatus: changeStatus}}>
            {children}
        </ModalContext.Provider>
    );
}

export { ModalProvider, ModalContext };