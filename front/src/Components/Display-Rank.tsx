import Silver from "../Assets/Ranks/silver.png";
import Gold from "../Assets/Ranks/gold.png";
import Platine from "../Assets/Ranks/platine.png";
import Diamond from "../Assets/Ranks/diamond.png";
import Champion from "../Assets/Ranks/champion.png";
import Legend from "../Assets/Ranks/legend.png";

function DisplayRank(props: {elo: number}) {
    const { elo } = props;

    if (elo < 1000)
        return ( <div className="rank-icon" data-tooltips-rank="Silver"> <img src={Silver} alt="Rank icone" /> </div>);
    else if (elo >= 1000 && elo < 1125)
        return ( <div className="rank-icon" data-tooltips-rank="Champion"> <img src={Gold} alt="Rank icone" /> </div>);
    else if (elo >= 1125 && elo < 1250)
        return ( <div className="rank-icon" data-tooltips-rank="Platine"> <img src={Platine} alt="Rank icone" /> </div>);
    else if (elo >= 1250 && elo < 1375)
        return ( <div className="rank-icon" data-tooltips-rank="Diamond"> <img src={Diamond} alt="Rank icone" /> </div>);
    else if (elo >= 1375 && elo < 1500)
        return ( <div className="rank-icon" data-tooltips-rank="Champion"> <img src={Champion} alt="Rank icone" /> </div>);
    else
        return ( <div className="rank-icon" data-tooltips-rank="Legend"> <img src={Legend} alt="Rank icone" /> </div>);
}

export default DisplayRank;