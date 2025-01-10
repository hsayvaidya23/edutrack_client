import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, User } from '../types/user';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { jwtDecode } from 'jwt-decode';  // Changed this line

interface AuthContextType {
  authToken: string | null;
  currentUser: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<void>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken') || null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user data from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Decode the token to get user data
          const decodedToken: { id: string; role: User['role'] } = jwtDecode(token);
          setCurrentUser({ id: decodedToken.id, role: decodedToken.role } as User);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, role: User['role']) => {
    const { token, user } = await apiLogin(email, password, role);
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user); // Ensure the user object contains the correct role
  };

  const register = async (userData: Omit<User, 'id'>) => {
    const { token, user } = await apiRegister(userData);
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};