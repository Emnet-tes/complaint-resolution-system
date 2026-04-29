import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../api/api';

// Roles as returned by backend: SysAdmin, OrgAdmin, OrgHead, DeptHead
export type Role = 'SysAdmin' | 'OrgAdmin' | 'OrgHead' | 'DeptHead' | null;

export interface User {
  fullname: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get('user');
    const token = Cookies.get('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const response = await authApi.login(credentials);
    const data = response.data as any;

    // Support both `token` and `access_token` just in case
    const token: string | undefined = data.token ?? data.access_token;

    // Backend sample response:
    // { message: string, _id: string, role: 'SysAdmin' | 'OrgAdmin' | 'DeptAdmin', token: string }
    const user: User = {
      fullname: data.fullname ?? '',
      email: data.email ?? credentials.email ?? '',
      role: (data.role as Role) ?? null,
    };

    if (token) {
      // Store token in cookie (Expires in 7 days, Secure, SameSite)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
    }

    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    setUser(user);

    return user;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};