import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Silent Refresh Helper
  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        return { success: true, token: data.token };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [API_URL]);

  // Auth fetch wrapper (Fetch Interceptor equivalent)
  const authFetch = useCallback(async (url, options = {}) => {
    const activeToken = localStorage.getItem('token');
    
    // Inject headers and credentials
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
    };

    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include' // Send cookies
    };

    try {
      let response = await fetch(url, fetchOptions);

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh')) {
        console.warn('⚡ Access token expired. Attempting silent token refresh...');
        const refreshResult = await silentRefresh();
        
        if (refreshResult.success) {
          // Update headers with new token
          fetchOptions.headers['Authorization'] = `Bearer ${refreshResult.token}`;
          // Retry original request
          response = await fetch(url, fetchOptions);
        } else {
          // Logout on refresh failure
          logout();
        }
      }

      return response;
    } catch (err) {
      console.error('Fetch interceptor error:', err);
      throw err;
    }
  }, [silentRefresh]);

  useEffect(() => {
    const loadUser = async () => {
      // If we don't have token in localStorage, we still try /me in case cookies are set
      try {
        const res = await authFetch(`${API_URL}/api/auth/me`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error loading user session', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, authFetch, API_URL]);

  // Signup Patient
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.');
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, role: data.user.role };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.');
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async (googlePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, role: data.user.role };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Google Sign-In failed.');
      return { success: false, message: 'Google auth server error.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      // Suppress network failures on logout API call
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    authFetch,
    apiUrl: API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

