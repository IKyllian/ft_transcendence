import { Navigate } from 'react-router-dom';
import { IsLog } from '../Utils/Utils-User';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const auth = IsLog();
    return auth ? children : <Navigate to="/sign" />;
}

export default PrivateRoute;