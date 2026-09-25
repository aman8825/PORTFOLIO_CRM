import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setAdmin(res.data.data);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        setAdmin(res.data.data);
        return true;
      }
      return false;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        return false;
      }
      throw error;
    }
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
