import Silver from "../Images-Icons/Ranks/silver.png";
import Gold from "../Images-Icons/Ranks/gold.png";
import Platine from "../Images-Icons/Ranks/platine.png";
import Diamond from "../Images-Icons/Ranks/diamond.png";
import Champion from "../Images-Icons/Ranks/champion.png";
import Legend from "../Images-Icons/Ranks/legend.png";

function DisplayRank(props: {elo: number}) {
    const { elo } = props;

    console.log("ELO", elo);

    if (elo < 1000)
        return ( <img src={Silver} alt="Rank icone" /> );
    else if (elo >= 1000 && elo < 1125)
        return ( <img src={Gold} alt="Rank icone" /> );
    else if (elo >= 1125 && elo < 1250)
        return ( <img src={Platine} alt="Rank icone" /> );
    else if (elo >= 1250 && elo < 1375)
        return ( <img src={Diamond} alt="Rank icone" /> );
    else if (elo >= 1375 && elo < 1500)
        return ( <img src={Champion} alt="Rank icone" /> );
    else
        return ( <img src={Legend} alt="Rank icone" /> );
}

export default DisplayRank;