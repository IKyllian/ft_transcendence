import { Navigate } from 'react-router-dom';
import IsConnectedLoading from '../Components/Utils/Is-Connected-Loading';
import { useAppSelector } from '../Redux/Hooks';
import { IsLog } from '../Utils/Utils-User';

function PrivateRoute({ children }: { children: JSX.Element }) {
	console.log("PRIVATE ROUTE");
    const auth = IsLog();
    const {loadingIsConnected} = useAppSelector(state => state.auth);
    if (!loadingIsConnected) {
        return auth ? children : <Navigate to="/sign" />;
    } else {
        return (
            <IsConnectedLoading />
        )
    }
}

export default PrivateRoute;