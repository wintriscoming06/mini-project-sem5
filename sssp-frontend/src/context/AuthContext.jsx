import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sssp_token');
    const storedUser = localStorage.getItem('sssp_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Accepts either login({ identifier, password }) or login(identifier, password).
  // Backend returns a flat AuthResponse: { token, type, userId, username, email, role, evaluatorPermission }.
  const login = async (identifierOrData, maybePassword) => {
    const payload =
      typeof identifierOrData === 'object' && identifierOrData !== null
        ? identifierOrData
        : { identifier: identifierOrData, password: maybePassword };

    const response = await authService.login(payload);
    const { token: jwt, type, ...userData } = response.data;
    const normalizedUser = { ...userData, id: userData.userId };

    localStorage.setItem('sssp_token', jwt);
    localStorage.setItem('sssp_user', JSON.stringify(normalizedUser));
    setToken(jwt);
    setUser(normalizedUser);
    return response;
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = () => {
    localStorage.removeItem('sssp_token');
    localStorage.removeItem('sssp_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!token;
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
