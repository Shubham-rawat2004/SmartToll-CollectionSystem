import axios from "axios";

const STORAGE_KEY = "smart_toll_auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong.";

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      delete api.defaults.headers.common.Authorization;
    }

    return Promise.reject({
      ...error,
      status,
      message,
    });
  }
);

const storedAuth = localStorage.getItem(STORAGE_KEY);
if (storedAuth) {
  const { token } = JSON.parse(storedAuth);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

export default api;
