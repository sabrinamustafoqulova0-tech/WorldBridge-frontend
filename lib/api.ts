import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useLangStore } from "../store/langStore";

const api = axios.create({
  baseURL: "https://worldbridge-backend.onrender.com/api/v1",
});

// Request interceptor: add Authorization header + inject lang into GET requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Automatically pass current lang to all GET requests so the backend
  // returns content in the right language.
  if (!config.method || config.method.toLowerCase() === "get") {
    const lang = useLangStore.getState().lang;
    config.params = { lang, ...config.params };
  }

  return config;
});

// Response interceptor: handle 401 and refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post("http://127.0.0.1:8000/api/v1/auth/refresh", {
          refresh_token: refreshToken
        });

        useAuthStore.getState().setTokens(data.access_token);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
