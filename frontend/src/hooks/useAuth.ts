import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);

    const handleAuthError = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('auth_error', handleAuthError);
    return () => window.removeEventListener('auth_error', handleAuthError);
  }, []);

  const login = (userData: any, _token: string) => {
    // Note: token is already saved in localStorage by the client API if needed, 
    // but typically we should save it here. Our login component might do it, 
    // or we do it here. For safety we just sync state.
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, isLoadingAuth, login, logout };
}
