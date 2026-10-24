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

  // Accepts either login({ identifier, password, role }) or login(identifier, password, role).
  // Backend returns a flat AuthResponse: { token, type, userId, username, role, evaluatorPermission }.
  const login = async (identifierOrData, maybePassword, maybeRole) => {
    let payload;
    if (typeof identifierOrData === 'object' && identifierOrData !== null) {
      payload = { ...identifierOrData };
    } else {
      payload = { identifier: identifierOrData, password: maybePassword };
      if (maybeRole) payload.role = maybeRole;
    }

    if (!payload.role) {
      throw new Error('Please select your login portal role (Player, Coach, Scout, or Organizer) before signing in.');
    }

    const response = await authService.login(payload);
    const { token: jwt, type, ...userData } = response.data;
    const normalizedUser = { ...userData, id: userData.userId };

    // Frontend strict role enforcement guard
    const requestedRole = payload.role;
    if (requestedRole && normalizedUser.role !== 'ADMIN' && normalizedUser.role !== requestedRole) {
      const formatRole = (r) => {
        if (!r) return 'another';
        return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
      };
      const portalLabel = formatRole(requestedRole);
      const userRoleLabel = formatRole(normalizedUser.role);
      throw new Error(`Access denied: You cannot log into the ${portalLabel} portal with a ${userRoleLabel} account. Please select the ${userRoleLabel} login portal.`);
    }

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
