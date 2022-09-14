import { Navigate } from 'react-router-dom';
import { IsLog } from "../Service/auth";

function PrivateRoute({ children }: { children: JSX.Element }) {
    const auth = IsLog();
    console.log(auth);
    return auth ? children : <Navigate to="/sign" />;
}

export default PrivateRoute;