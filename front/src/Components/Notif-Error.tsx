import { IconX } from "@tabler/icons";

function NotifError(props: {error: string | undefined, closeError: Function}) {
    const { error, closeError } = props;
    return error !== undefined ?  (
        <div className="notif-error-wrapper">
            <div className="notif-content-container">
                <IconX onClick={() => closeError()} />
                <p> {error} </p>
            </div>
        </div>
    ) : (
        <> </>
    );
}

export default NotifError;