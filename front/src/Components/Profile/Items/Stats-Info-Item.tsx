import React from "react";

function StatsInfoItem(props: any) {
    const { label, value } = props;
    return (
        <div className='stat-elem'>
            <p> { label } </p>
            <p> { value } </p>
        </div>
    );
}

export default StatsInfoItem;