import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { token, userType } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && userType !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PrivateRoute;