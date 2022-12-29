import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons";
import { useEffect, useState } from "react";
import { AlertState, AlertType, removeAlert } from "../Redux/AlertSlice";
import { useAppDispatch, useAppSelector } from "../Redux/Hooks";

function AlertItem(props: {elem: AlertState}) {
    const {elem} = props;
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
    const dispatch = useAppDispatch();

    const closeSuccess = (id: number) => {
        clearTimeout(timeoutId);
        dispatch(removeAlert(id));
    }

    const getClass = (type: AlertType): string => {
        if (type === AlertType.ERROR)
            return "error";
        else if (type === AlertType.SUCCESS)
            return "success";
        return "warning";
    }

    useEffect(() => {
        setTimeoutId(setTimeout(() => {
            dispatch(removeAlert(elem.id));
        }, 5000));

        return () => {
            clearTimeout(timeoutId);
        }
    }, [])

    return (

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
    );
}

function Alert() {
    const {alerts} = useAppSelector(state => state.alerts);

    return alerts.length > 0 ? (
        <div className="notif-container">
            {
                alerts.map(elem => 
                    <AlertItem key={elem.id} elem={elem} />
                )
            }
        </div>
    ) : (
        <> </>
    );
}

export default Alert;