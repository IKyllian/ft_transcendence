function StatsInfoItem(props: {label: string, value: string}) {
    const { label, value } = props;
    return (
        <div className='stat-elem'>
            <p> { label } </p>
            <p> { value } </p>
        </div>
    );
}

export default StatsInfoItem;