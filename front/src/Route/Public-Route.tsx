import { Navigate } from 'react-router-dom';
import { IsLog } from "../Service/auth";

function PublicRoute({ children }: { children: JSX.Element }) {
    const auth = IsLog();
    console.log(auth);
    return !auth ? children : <Navigate to="/" />;
}

export default PublicRoute;