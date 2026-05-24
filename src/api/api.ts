import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

/** Base URL must include `/api` if your server mounts routes there (e.g. `http://localhost:5000/api`). */
const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  "https://ai-complaint-backend-7xc5.onrender.com/api";
const API_URL = rawBase.replace(/\/+$/, "");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** No HTTP response yet — browser/transport closed the connection (Render cold start, sleep, overload, etc.). */
function isTransientNetworkError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { response?: unknown; code?: string; message?: string };
  if (e.response !== undefined) return false;
  const code = e.code || "";
  const msg = (e.message || "").toLowerCase();
  return (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    msg.includes("network error") ||
    msg.includes("connection closed") ||
    msg.includes("failed to fetch")
  );
}

async function withNetworkRetries<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (!isTransientNetworkError(error) || i === attempts - 1) throw error;
      await sleep(900 * (i + 1));
    }
  }
  throw last;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 90_000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetriableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let refreshInFlight: Promise<string | null> | null = null;

const clearAuthCookies = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('user');
};

const refreshAccessToken = async () => {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = authApi
      .refreshToken(refreshToken)
      .then((response) => {
        const data = response.data as any;
        const newAccessToken: string | undefined = data.accessToken ?? data.token ?? data.access_token;
        const newRefreshToken: string | undefined = data.refreshToken ?? data.refresh_token;
        const expiresIn: number | undefined = data.expiresIn ?? data.expires_in;

        if (!newAccessToken) return null;

        const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const cookieOpts = {
          expires: expiresIn ? Math.max(expiresIn / 86400, 1 / 48) : 1,
          secure: isSecureContext,
          sameSite: 'strict' as const,
        };

        Cookies.set('accessToken', newAccessToken, cookieOpts);
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, { ...cookieOpts, expires: 30 });
        }

        return newAccessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

// Request Interceptor: Attach access token to headers
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || '';

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(originalRequest);
      }

      clearAuthCookies();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  /** Retries help when the host (e.g. Render free tier) closes the first connection during wake-up. */
  login: (data: any) => withNetworkRetries(() => api.post("/auth/login", data)),
  register: (data: any) => api.post('/auth/register', data), // Used by Org Admin to add employees
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  forgotPasswordOtp: (email: string) => api.post('/auth/forgot-password-otp', { email }),
  resetPassword: (data: { token: string; email: string; password: string }) =>
    api.post('/auth/reset-password', data),
  resetPasswordOtp: (data: { email: string; otp: string; password: string }) =>
    api.post('/auth/reset-password-otp', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

export default api;
