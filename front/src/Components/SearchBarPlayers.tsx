import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons";

import { usersArray } from "../Interfaces/Datas-Examples"
import { ExampleUser } from "../Interfaces/Interface-User";
import SearchBarButtons from "./SearchBarButtons";

function SearchBarPlayers(props: {functionality: string}) {
    const [inputText, setInputText] = useState<string>("");
    const [arrayResult, setArrayResult] = useState<ExampleUser[]>([]);

    const {functionality} = props;

    const handleChange = (e: any) => {
        setInputText(e.target.value);
    }

    useEffect(() => {
        if (inputText.length > 0) {
            let newArray: ExampleUser[] = [];

            newArray = usersArray.filter(elem => ((elem.name.toLowerCase().includes(inputText.toLowerCase())) === true));
            setArrayResult(newArray);
        } else {
            setArrayResult([]);
        }
    }, [inputText])

    return (
        <div className='search-player-container'>
            <div className="modal-search">
                <IconSearch />
                <input type="text" placeholder="Search a user" value={inputText} onChange={(e) => handleChange(e)} />
            </div>
            <div className="modal-player-list">
                {
                    arrayResult.map((elem, index) =>
                        <div key={index} className="modal-player-list-item">
                            <div className="item-player-info">
                                <img className='modal-picture' src={elem.profilPic} alt="profil pic" />
                                <p> {elem.name} </p>
                            </div>
                            <SearchBarButtons functionality={functionality} />
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default SearchBarPlayers;