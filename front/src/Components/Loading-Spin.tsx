
function LoadingSpin(props: {classContainer?: string}) {
    const {classContainer} = props;
    return classContainer ? (
        <div className={classContainer}>
            <div className="loading-spin"></div>
        </div>
    ) : (
        <div className="loading-spin"></div>
    );
}

export default LoadingSpin;