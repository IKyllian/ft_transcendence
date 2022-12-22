
function AlertValidation(props: {closeFunction: Function, validateFunction: Function, textAlert: string}) {
    const { closeFunction, validateFunction, textAlert } = props;
    return (
        <div className="alert-validation-container">
            <p> {textAlert} </p>
            <div className="buttons-container">
                <button onClick={() => validateFunction()}> Cancel </button>
                <button onClick={() => closeFunction()}> Cancel </button>
            </div>
        </div>
    );
}

export default AlertValidation;