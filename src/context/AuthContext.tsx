import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: {
    data: string;
    contentType: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const getAuthHeaders = () => {
    // Try both sessionStorage and localStorage for token
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const checkAuth = async () => {
    try {
      // Check both sessionStorage and localStorage for token and user
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user') || localStorage.getItem('authUser');
      
      // If we have stored user data, use it immediately to avoid null state
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.warn('Failed to parse stored user data:', e);
        }
      }
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store the JWT token in both localStorage and sessionStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        sessionStorage.setItem('authToken', data.token);
      }

      // After successful login, fetch the full user profile including avatar
      const profileResponse = await fetch('/api/auth/me', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user);
        // Store user data in sessionStorage for immediate availability on refresh
        sessionStorage.setItem('user', JSON.stringify(profileData.user));
      } else {
        setUser(data.user);
        // Store user data in sessionStorage for immediate availability on refresh
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid email or password');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove token and user data from both storages
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      setUser(null);
      
      // Optional: Call logout endpoint if it exists
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 