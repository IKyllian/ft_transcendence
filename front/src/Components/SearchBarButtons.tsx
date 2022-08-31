
function SearchBarButtons(props: {functionality: string}) {
    const { functionality } = props;
    if (functionality === "addFriend") {
        return (
            <button> Add friend </button>
        );
    } else if (functionality === "chanInvite") {
        return (
            <input type="checkbox" />
        );
    } else {
        return (
            <button> Send message </button>
        );
    }
}

export default SearchBarButtons;