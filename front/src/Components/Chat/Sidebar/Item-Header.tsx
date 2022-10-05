import { IconChevronDown, IconPlus, IconChevronRight } from "@tabler/icons";

interface Props {
    title: string,
    sidebarOpen: boolean,
    handleClick: Function,
    modalStatus?: Function,
}

function ItemHeader(props: Props) {
    const {title, sidebarOpen, handleClick, modalStatus} = props;
    return (
        <div className="collapse-button">
            <div className="collapse-button-name">
                { sidebarOpen ? <IconChevronDown onClick={() => handleClick()} /> : <IconChevronRight onClick={() => handleClick()} /> }
                <p> {title} </p>
            </div>
            <IconPlus className="plus-icon" onClick={() => modalStatus!()} />
        </div>
    );
}

export default ItemHeader;