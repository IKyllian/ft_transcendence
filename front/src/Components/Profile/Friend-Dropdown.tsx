import DropdownContainer from "../Utils/Dropdown-Container";

function FriendListModal(props: {show: boolean, onClickOutside: Function}) {
    const { show, onClickOutside } = props;
    return (
        <DropdownContainer show={show} onClickOutside={onClickOutside} >
            <p className="red-item"> Delete friend </p>
            <p> Défier </p>
            <p> Send message </p>
        </DropdownContainer>
    );
}

export default FriendListModal;