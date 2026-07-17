import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost:9000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on startup
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Backend connection failed, using offline fallback user session.');
        // For portfolio demonstration purposes, if the backend server is offline, we'll keep the session active with mock data
        if (token === 'mock_token_sarah') {
          setUser({
            id: 1,
            name: 'Sarah Jenkins',
            email: 'admin@industrial-project.com',
            role: 'Admin',
            department: 'Administration',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
          });
        } else if (token === 'mock_token_marcus') {
          setUser({
            id: 2,
            name: 'Marcus Vance',
            email: 'director@industrial-project.com',
            role: 'PMO Director',
            department: 'PMO Office',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
          });
        } else if (token.startsWith('mock_token_')) {
          setUser({
            id: 3,
            name: 'Elena Rostova',
            email: 'pm.buildings@industrial-project.com',
            role: 'Project Manager',
            department: 'Buildings',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          });
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        throw new Error('Authentication endpoint rejected request or backend is unreachable.');
      }
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend server offline. Initiating mock authentication fallback.');
      
      // Standalone/offline fallback credentials
      let mockUserObj = null;
      let mockTok = '';
      if (email === 'admin@industrial-project.com' && password === 'password123') {
        mockUserObj = {
          id: 1,
          name: 'Sarah Jenkins',
          email: email,
          role: 'Admin',
          department: 'Administration',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        };
        mockTok = 'mock_token_sarah';
      } else if (email === 'director@industrial-project.com' && password === 'password123') {
        mockUserObj = {
          id: 2,
          name: 'Marcus Vance',
          email: email,
          role: 'PMO Director',
          department: 'PMO Office',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        };
        mockTok = 'mock_token_marcus';
      } else if (password === 'password123') {
        // General project manager / engineer dynamic mock login
        mockUserObj = {
          id: 3,
          name: 'Elena Rostova',
          email: email,
          role: email.includes('pm') ? 'Project Manager' : 'Engineer',
          department: 'Buildings',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        };
        mockTok = `mock_token_${email.split('@')[0]}`;
      }

      if (mockUserObj) {
        localStorage.setItem('token', mockTok);
        setToken(mockTok);
        setUser(mockUserObj);
        setLoading(false);
        return { success: true };
      } else {
        setError('Invalid mock credentials. Hint: use password123');
        setLoading(false);
        return { success: false, message: 'Invalid credentials. Hint: use password123' };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, isAuthenticated: !!user, apiUrl: API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
