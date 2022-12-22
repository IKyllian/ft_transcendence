import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../Redux/Hooks';
import IsConnectedLoading from '../Components/Utils/Is-Connected-Loading';
import { useContext } from 'react';
import { CacheContext, SocketContext } from '../App';

function PublicRoute({ children }: { children: JSX.Element }) {
    const {loadingIsConnected, isAuthenticated} = useAppSelector(state => state.auth);
    const {socket} = useContext(SocketContext);
    const {cache} = useContext(CacheContext);
    
    if (!loadingIsConnected) {
        if (!isAuthenticated)
            return children;
        else {
            if (!socket || cache === undefined)
                return <IsConnectedLoading />;
            return <Navigate to="/" />;
        }
    } else {
        return (
            <IsConnectedLoading />
        )
    }
}

export default PublicRoute;