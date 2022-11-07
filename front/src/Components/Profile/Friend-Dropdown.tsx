import DropdownContainer from "../Utils/Dropdown-Container";

function FriendListModal(props: {show: boolean, onClickOutside: Function}) {
    const { show, onClickOutside } = props;
    return (
        <DropdownContainer show={show} onClickOutside={onClickOutside} >
            <p> Send message </p>
            <p> Défier </p>
            <p className="red-item"> Delete friend </p>
        </DropdownContainer>
    );
}

export default FriendListModal;