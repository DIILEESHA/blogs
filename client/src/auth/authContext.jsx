// src/auth/authContext.js
import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser } from "../api/Api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    username: localStorage.getItem('username') || null,
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    userType: localStorage.getItem('userType') || 'customer' // Default to customer
  });

  const login = async (credentials, navigate) => {
    try {
      const response = await loginUser(credentials.email, credentials.password);
      
      if (response && response.token) {
        // Ensure userType is lowercase
        const userType = (response.userType || 'customer').toLowerCase();
        
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username || credentials.email);
        localStorage.setItem("userId", response.userId || response.id);
        localStorage.setItem("userType", userType);

        setAuthState({
          username: response.username || credentials.email,
          token: response.token,
          userId: response.userId || response.id,
          userType: userType
        });

        if (navigate) {
          navigate(userType === 'admin' ? "/admin" : "/");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = (navigate) => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    setAuthState({ 
      username: null, 
      token: null, 
      userId: null,
      userType: 'customer' 
    });
    if (navigate) {
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      username: authState.username,
      userId: authState.userId,
      userType: authState.userType,
      token: authState.token,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};