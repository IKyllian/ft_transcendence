import { UserInterface, UsersListInterface } from "./User-Types";

export interface SearchBarButtonsProps {
    functionality: SearchBarFunctionality,
    user?: UserInterface,
    checkboxOnChange?: Function,
    checkboxArray?: UserInterface[],
    handleSendMessage?: Function,
    userFromList?: UsersListInterface,
}

export enum SearchBarFunctionality {
    SEND_MESSAGE,
    ADD_FRIEND,
    CHAN_INVITE,
    CHAN_INVITE_ON_CREATE,
    PARTY_INVITE,
}

export enum Modes {
    Singles = "Singles",
    Doubles = "Doubles",
};