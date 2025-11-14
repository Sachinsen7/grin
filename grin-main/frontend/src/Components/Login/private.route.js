





import React from 'react';
import { Navigate } from 'react-router-dom';
import tokenManager from '../../utils/tokenManager';

const PrivateRoute = ({ allowedRole, children }) => {
  const token = tokenManager.getToken();
  const userRole = tokenManager.getRole();

  // Check if token exists and is valid
  if (!token || !tokenManager.isTokenValid()) {
    tokenManager.clearToken();
    return <Navigate to="/" />;
  }

  // Check if user role matches the allowed role
  if (!userRole || userRole !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
