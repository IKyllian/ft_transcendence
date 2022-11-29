import DisplayRank from "../Display-Rank";

function StatsInfoItem(props: {label: string, value?: string, elo?: number}) {
    const { label, value, elo } = props;
    return (
        <div className='stat-elem'>
            <p> { label } </p>
            { label !== "rank" && <p> { value } </p> }
            { label === "rank" && <DisplayRank elo={elo!} /> }
        </div>
    );
}

export default StatsInfoItem;