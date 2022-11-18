import axios from "axios";
import { baseUrl } from "../env";

export async function fetchIsAlreadyInGame(token: string): Promise<boolean> {
    let isInGame: boolean = false;
   await axios.get(`${baseUrl}/game/is-playing`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log("response", response.data);
        isInGame = response.data;
    })
    .catch(err => {
        console.log(err);
    })
    return isInGame;
}