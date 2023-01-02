function LoadingSpin(props: {classContainer?: string}) {
    const {classContainer} = props;
    return classContainer ? (
        <div className={classContainer}>
            <span className="loader"></span>
        </div>
    ) : (
        <span className="loader"></span>
    );
}

export default LoadingSpin;