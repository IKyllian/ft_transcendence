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

function BlockAchievement() {
    return (
        <div className="profile-block-wrapper achievement-list">
            <AchievementItem />
            <AchievementItem />
            <AchievementItem />
            <AchievementItem />
            <AchievementItem />
            <AchievementItem />
        </div>
    );
}

export default BlockAchievement;