'use client'

import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user state from localStorage and fetch fresh data
  useEffect(() => {
    const initializeUser = async () => {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Fetch fresh user data
          try {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${savedToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          } catch (error) {
            console.error('Failed to fetch fresh user data:', error);
          }
        }
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Save to localStorage when user or token changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user && token) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [user, token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Register function
  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    if (!token) {
      setError('No authentication token');
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      setUser(data.user);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && token);
  };

  // Make authenticated API requests
  const apiRequest = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...options, ...defaultOptions });

    if (response.status === 401) {
      // Token expired or invalid, logout user
      logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    apiRequest,
    refreshUser,
    setUser,
    setError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};