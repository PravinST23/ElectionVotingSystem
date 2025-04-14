import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      console.log('Decoded token on load:', decoded); // Debug
      setUser({ role: decoded.role, email: decoded.email });
      navigateRole(decoded.role);
    }
  }, [token]);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return {
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role,
        email: decoded['email']
      };
    } catch (error) {
      console.error('Token decoding failed:', error);
      return { role: null, email: null };
    }
  };

  const navigateRole = (role) => {
    switch (role) {
      case 'Admin': navigate('/admin'); break;
      case 'Official': navigate('/official'); break;
      case 'Voter': navigate('/voter'); break;
      default: navigate('/login');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await login({ username: email, password });
      console.log('Login response:', response); // Debug
      setToken(response.token);
      localStorage.setItem('token', response.token);
      const decoded = decodeToken(response.token);
      setUser({ role: decoded.role, email: decoded.email });
      navigateRole(decoded.role);
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (data) => {
    await register(data);
    navigate('/login');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, handleLogin, handleRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};