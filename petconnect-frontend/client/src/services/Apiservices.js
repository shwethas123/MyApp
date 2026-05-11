import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// RESPONSE interceptor — handle 401 (token expired)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.some((p) => window.location.pathname === p || 
                                           window.location.pathname.startsWith(p));
  if (isPublic) return;
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
     const originalRequest = error.config;
     const isRefreshEndpoint = originalRequest.url?.includes("/users/refresh-token");
 
    // 401 — access token missing or expired; try refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      const isProfileEndpoint = originalRequest.url?.includes("/users/profile");
      if (isProfileEndpoint) return Promise.reject(error);

      const isConvCheckEndpoint = originalRequest.url?.includes("/conversations/check");
      if (isConvCheckEndpoint) return Promise.reject(error);

      // ✅ NEW — login failures should never trigger a token refresh
      const isLoginEndpoint = originalRequest.url?.includes("/users/login");
      if (isLoginEndpoint) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
 
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/users/refresh-token");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && isRefreshEndpoint) {
      redirectToLogin();
      return Promise.reject(error);
    }
 
    // 403 — account banned or role not authorised
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

const get = (url, config = {}) => api.get(url, config);
const post = (url, data, config = {}) => api.post(url, data, config);
const put = (url, data, config = {}) => api.put(url, data, config);
const patch = (url, data, config = {}) => api.patch(url, data, config);
const del = (url, config = {}) => api.delete(url, config);

export default { get, post, put, patch, del };