import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../api/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, setUser, setAuthLoading, clearAuth } from '../store/slices/authSlice';
import type { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const refreshProfile = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const response = await authApi.getProfile();
      const data = response.data;
      const profileData = data.user || data;
      
      if (profileData) {
        const updatedUser: User = {
          firstName: profileData.firstName || user?.firstName,
          lastName: profileData.lastName || user?.lastName,
          fullname:
            profileData.fullName ??
            profileData.fullname ??
            (profileData.firstName
              ? `${profileData.firstName} ${profileData.lastName || ''}`.trim()
              : user?.fullname || ''),
          email: profileData.email || user?.email || '',
          role: (profileData.role as Role) || user?.role || null,
          profilePicture: profileData.profilePicture || profileData.avatar || user?.profilePicture,
        };
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
        dispatch(setUser(updatedUser));
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setAuthLoading(true));
      const savedUser = Cookies.get('user');
      const token = Cookies.get('token');
      
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser) as User;
        dispatch(setCredentials({ token, user: parsedUser }));
      }
      
      await refreshProfile();
      dispatch(setAuthLoading(false));
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const response = await authApi.login(credentials);
    const data = response.data as any;

    // Support both `token` and `access_token` just in case
    const token: string | undefined = data.token ?? data.access_token;

    // Backend sample response:
    // { message: string, _id: string, role: 'SysAdmin' | 'OrgAdmin' | 'DeptAdmin', token: string }
    const user: User = {
      fullname: data.fullName ?? data.fullname ?? '',
      email: data.email ?? credentials.email ?? '',
      role: (data.role as Role) ?? null,
    };

    if (token) {
      const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';
      // Store token in a cookie that works on local HTTP and production HTTPS.
      Cookies.set('token', token, { expires: 7, secure: isSecureContext, sameSite: 'strict' });
    }

    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    if (token) {
      dispatch(setCredentials({ token, user }));
    } else {
      dispatch(setUser(user));
      dispatch(setAuthLoading(false));
    }

    return user;
  };

  const logout = async () => {
    Cookies.remove('token');
    Cookies.remove('user');
    dispatch(clearAuth());
    
    // Fire and forget API
    authApi.logout().catch(error => {
      console.error('Failed to notify backend about logout', error);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};