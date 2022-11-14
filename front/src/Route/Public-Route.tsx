import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../Redux/Hooks';
import { IsLog } from '../Utils/Utils-User';
import IsConnectedLoading from '../Components/Utils/Is-Connected-Loading';

function PublicRoute({ children }: { children: JSX.Element }) {
	console.log("PUBLIC ROUTE");
    const auth = IsLog();
    const {loadingIsConnected} = useAppSelector(state => state.auth);
    if (!loadingIsConnected) {
        return !auth ? children : <Navigate to="/" />;
    } else {
        return (
            <IsConnectedLoading />
        )
    }
}

export default PublicRoute;