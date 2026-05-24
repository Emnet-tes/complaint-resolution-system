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

/** Backend may return DeptAdmin while the app uses DeptHead for department operators. */
function mapBackendRole(raw: string | undefined | null): Role {
  if (!raw) return null;
  if (raw === 'DeptAdmin' || raw === 'DepartmentAdmin') return 'DeptHead';
  return raw as Role;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const refreshProfile = async () => {
    // Read the new cookie key
    const token = Cookies.get('accessToken');
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
          role: mapBackendRole(profileData.role) || user?.role || null,
          profilePicture: profileData.profilePicture || profileData.avatar || user?.profilePicture,
        };
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
        dispatch(setUser(updatedUser));
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setAuthLoading(true));
      const savedUser    = Cookies.get('user');
      const accessToken  = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (savedUser && accessToken) {
        const parsedUser = JSON.parse(savedUser) as User;
        dispatch(
          setCredentials({
            accessToken,
            refreshToken: refreshToken ?? '',
            expiresIn: 900,
            user: parsedUser,
          }),
        );
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

    // Support both shapes: { token, role, ... } (Swagger) and { accessToken, refreshToken, ... }
    const accessToken: string | undefined =
      data.accessToken ?? data.token ?? data.access_token;
    const refreshToken: string =
      data.refreshToken ?? data.refresh_token ?? '';
    const expiresIn: number =
      data.expiresIn ?? data.expires_in ?? 900;

    if (!accessToken) {
      throw new Error(
        data?.message ||
          'Login succeeded but no access token was returned. Expected `token` or `accessToken` in the response body.',
      );
    }

    // The profile endpoint fills fullname/email later via refreshProfile;
    // seed from credentials so the nav role check works immediately.
    const user: User = {
      fullname: data.fullName ?? data.fullname ?? '',
      email: data.email ?? credentials.email ?? '',
      role: mapBackendRole(data.role),
    };

    const isSecureContext =
      typeof window !== 'undefined' && window.location.protocol === 'https:';
    const accessCookieOpts = {
      expires: expiresIn ? Math.max(expiresIn / 86400, 1 / 48) : 1 / 96,
      secure: isSecureContext,
      sameSite: 'strict' as const,
    };
    const refreshCookieOpts = {
      expires: 30,
      secure: isSecureContext,
      sameSite: 'strict' as const,
    };

    Cookies.set('accessToken', accessToken, accessCookieOpts);
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, refreshCookieOpts);
    }
    Cookies.set('user', JSON.stringify(user), refreshCookieOpts);

    dispatch(setCredentials({ accessToken, refreshToken, expiresIn, user }));

    // Profile fetch can 401 on some setups; don't block login or risk interceptor clearing cookies.
    void refreshProfile();

    return user;
  };

  const logout = async () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    dispatch(clearAuth());

    // Fire and forget — don't block the UI on the API response
    authApi.logout().catch((error) => {
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