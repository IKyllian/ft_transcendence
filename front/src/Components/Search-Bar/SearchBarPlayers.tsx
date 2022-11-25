import { IconSearch } from "@tabler/icons";
import UserFindItem from "./User-Find-Item";
import { UserInterface } from "../../Types/User-Types";
import Avatar from "../../Images-Icons/pp.jpg"
import { useSearchBarHook } from "../../Hooks/SearchBar-Hook";
import { SearchBarFunctionality } from "../../Types/Utils-Types";

function SearchBarPlayers(props: {functionality: SearchBarFunctionality, checkboxOnChange?: Function, checkboxArray?: UserInterface[], fetchUserFunction: Function}) {
    const {functionality, checkboxOnChange, checkboxArray, fetchUserFunction} = props;
    const {
        formHook,
        usersList,
        optimizedFn,
        handleSendMessage,
        renderSearchBarButton,
    } = useSearchBarHook({functionality, fetchUserFunction});

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" {...formHook.register('textInput', {onChange: () => {optimizedFn()}})} />
            </div>
            <div className="modal-player-list">
                {
                    formHook.getValues('textInput') && formHook.getValues('textInput').length > 0 && usersList && usersList.length > 0 &&
                    usersList.map((elem, index) =>
                        <UserFindItem key={index} avatar={elem.user.avatar} name={elem.user.username} status={elem.user.status} userId={elem.user.id}>
                            { renderSearchBarButton({functionality: functionality, user: elem.user, checkboxOnChange: checkboxOnChange, checkboxArray: checkboxArray, handleSendMessage: handleSendMessage, userFromList: elem}) }
                        </UserFindItem>
                    )
                }
                {
                    !formHook.getValues('textInput') && checkboxArray && checkboxArray.length > 0 &&
                    checkboxArray.map((elem, index) =>
                        <UserFindItem key={index} avatar={elem.avatar} name={elem.username} status={elem.status} userId={elem.id}>
                            { renderSearchBarButton({functionality: functionality, user: elem, checkboxOnChange: checkboxOnChange, checkboxArray: checkboxArray, handleSendMessage: handleSendMessage}) }
                        </UserFindItem>
                    )
                }
            </div>
        </div>
    );
}

export default SearchBarPlayers;