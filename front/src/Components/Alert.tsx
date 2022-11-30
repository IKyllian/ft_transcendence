import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons";
import { AlertType, removeAlert } from "../Redux/AlertSlice";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";

function Alert() {
    const {alerts} = useAppSelector(state => state.alerts);
    const dispatch = useAppDispatch();

    const closeSuccess = (id: number) => {
        dispatch(removeAlert(id));
    }

    const getClass = (type: AlertType): string => {
        if (type === AlertType.ERROR)
            return "error";
        else if (type === AlertType.SUCCESS)
            return "success";
        return "warning";
    }

    return alerts.length > 0 ? (
        <div className="notif-container">
            {
                alerts.map(elem => 
                    <div key={elem.id} className={`notif-wrapper notif-${getClass(elem.type)}`}>
                        <div className="notif-content-container">
                            <div className="icon-wrapper">
                                { elem.type === AlertType.SUCCESS && <IconCheck /> }
                                { elem.type === AlertType.ERROR && <IconX /> }
                                { elem.type === AlertType.WARNING && <IconAlertCircle /> }
                            </div>
                            <p> {elem.message} </p>
                            <IconX className="close-notif" onClick={() => closeSuccess(elem.id)} />
                        </div>
                    </div>
                )
            }
        </div>
    ) : (
        <> </>
    );
}

export default Alert;