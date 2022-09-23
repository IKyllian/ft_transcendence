import { IconChevronDown, IconPlus, IconChevronRight } from "@tabler/icons";

interface Props {
    title: string,
    publicItem: boolean
    sidebarOpen: boolean,
    handleClick: Function,
    modalStatus?: Function,
}

function ItemHeader(props: Props) {
    const {title, publicItem, sidebarOpen, handleClick, modalStatus} = props;
    return (
        <div className="collapse-button">
            <div className="collapse-button-name">
                { sidebarOpen ? <IconChevronDown onClick={() => handleClick()} /> : <IconChevronRight onClick={() => handleClick()} /> }
                <p> {title} </p>
            </div>
            {!publicItem && <IconPlus className="plus-icon" onClick={() => modalStatus!()} />}
        </div>
    );
}

export default ItemHeader;