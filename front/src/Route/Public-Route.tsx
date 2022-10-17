import { Navigate } from 'react-router-dom';
import { IsLog } from '../Utils/Utils-User';

function PublicRoute({ children }: { children: JSX.Element }) {
    const auth = IsLog();
    return !auth ? children : <Navigate to="/" />;
}

export default PublicRoute;