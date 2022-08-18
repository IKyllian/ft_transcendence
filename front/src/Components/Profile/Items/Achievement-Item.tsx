import React from "react";

import { IconMilitaryAward } from '@tabler/icons';

function AchievementItem() {
    return (
        <div className="achievement-item">
            <IconMilitaryAward />
            <div className="achievement-item-content">
                <p> I'm a winner </p>
                <p> Get your first win </p>
            </div>
        </div>
    );
}

export default AchievementItem;