import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('linkup_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('linkup_token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('linkup_token', res.data.token);
      setUser(res.data.user);
      // Fetch full profile
      try {
        const meRes = await authAPI.getMe();
        setProfile(meRes.data.profile);
      } catch (e) {}
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data.success) {
      localStorage.setItem('linkup_token', res.data.token);
      setUser(res.data.user);
      try {
        const meRes = await authAPI.getMe();
        setProfile(meRes.data.profile);
      } catch (e) {}
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('linkup_token');
    setUser(null);
    setProfile(null);
  };

  const updateUserData = (updatedUser, updatedProfile) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedProfile) setProfile(updatedProfile);
  };

  const isAdmin = user?.roles?.includes('Administrator');

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      updateUserData,
      isAdmin,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
