import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CacheContext, SocketContext } from '../App';
import IsConnectedLoading from '../Components/Utils/Is-Connected-Loading';
import { useAppSelector } from '../Redux/Hooks';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const {loadingIsConnected, isAuthenticated} = useAppSelector(state => state.auth);
    const {socket} = useContext(SocketContext);
    const {cache} = useContext(CacheContext);

    if (loadingIsConnected)
        return <IsConnectedLoading />;
    else if (!isAuthenticated)
        return <Navigate to="/sign" />;
    else if (isAuthenticated && (!socket || !cache))
        return <IsConnectedLoading />;
    return children;
}

export default PrivateRoute;