





import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ allowedRole, children }) => {
  const userRole = localStorage.getItem('role'); // 

  if (!userRole) {
    return <Navigate to="/" />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
