import Silver from "../Assets/Ranks/silver.png";
import Gold from "../Assets/Ranks/gold.png";
import Platine from "../Assets/Ranks/platine.png";
import Diamond from "../Assets/Ranks/diamond.png";
import Champion from "../Assets/Ranks/champion.png";
import Legend from "../Assets/Ranks/legend.png";

function DisplayRank(props: {elo: number}) {
    const { elo } = props;

    if (elo < 1000)
        return ( <img title="Silver" src={Silver} alt="Rank icone" /> );
    else if (elo >= 1000 && elo < 1125)
        return ( <img title="Gold" src={Gold} alt="Rank icone" /> );
    else if (elo >= 1125 && elo < 1250)
        return ( <img title="Platine" src={Platine} alt="Rank icone" /> );
    else if (elo >= 1250 && elo < 1375)
        return ( <img title="Diamond" src={Diamond} alt="Rank icone" /> );
    else if (elo >= 1375 && elo < 1500)
        return ( <img title="Champion" src={Champion} alt="Rank icone" /> );
    else
        return ( <img title="Legend" src={Legend} alt="Rank icone" /> );
}

export default DisplayRank;