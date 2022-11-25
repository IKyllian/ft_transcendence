import { IconX } from "@tabler/icons";

function MatchFound() {
    return (
        <div className="match-found-container">
            <div className="outside-circle">
                <IconX className="decline-button" />
            </div>
            <div className="fill-match-found">
                <div>
                    <p className="found-title"> Game Found </p>
                    <p> Ranked 1v1 </p>
                </div>
                <button className="accept-button"> Accept </button> 
                
            </div>
        </div>
    );
}

export default MatchFound;