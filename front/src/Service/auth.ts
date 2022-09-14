import { useAppSelector } from '../Redux/Hooks'

export function IsLog() {
    let authDatas = useAppSelector((state) => state.auth);
    
    if (authDatas.currentUser === undefined)
        return false;
    else
        return true;
}