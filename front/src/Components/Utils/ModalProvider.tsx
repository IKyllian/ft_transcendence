import { createContext, useState, ReactNode } from "react";

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

    const changeStatus = () => {
        setState({...state, isOpen: !state.isOpen});
    }

    return (
        <ModalContext.Provider value={{modal: state, setStatus: changeStatus}}>
            {children}
        </ModalContext.Provider>
    );
}

export { ModalProvider, ModalContext };