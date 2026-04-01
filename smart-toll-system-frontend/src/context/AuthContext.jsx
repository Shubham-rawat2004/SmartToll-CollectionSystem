import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "smart_toll_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : { token: null, user: null };
  });

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      delete api.defaults.headers.common.Authorization;
    }
  }, [auth]);

  const value = {
    token: auth.token,
    user: auth.user,
    isAuthenticated: Boolean(auth.token),
    login: ({ token, user }) => setAuth({ token, user }),
    updateUser: (user) => setAuth((current) => ({ ...current, user })),
    logout: () => setAuth({ token: null, user: null }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
