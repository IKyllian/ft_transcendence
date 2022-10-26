import { UserInterface, UsersListInterface } from "./User-Types";

export interface SearchBarButtonsProps {
    functionality: string,
    user?: UserInterface,
    checkboxOnChange?: Function,
    checkboxArray?: UserInterface[],
    handleSendMessage?: Function,
    userFromList?: UsersListInterface,
}