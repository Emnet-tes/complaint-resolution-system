import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach token to headers
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data), // Used by Org Admin to add employees
};

export default api;
