import { Navigate } from 'react-router-dom';
import tokenManager from '../utils/tokenManager';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = tokenManager.getToken();
    const userRole = tokenManager.getRole();

    // No token or expired token
    if (!token || !tokenManager.isTokenValid()) {
        tokenManager.clearToken();
        return <Navigate to="/" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
