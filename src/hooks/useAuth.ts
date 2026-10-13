import { useCallback, useState } from "react";
import api, {
  clearSession,
  getErrorMessage,
  getSession,
  saveSession,
} from "../services/apiClient";
import type { User } from "../types/crm";

export function useAuth() {
  const [session, setSession] = useState(getSession());
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      void remember;
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", { email, password });
        const next = { user: data.user as User, accessToken: data.tokens.accessToken as string, refreshToken: data.tokens.refreshToken as string };
        saveSession(next);
        setSession(next);
        return next;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      role: "manager" | "user" = "manager",
    ) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/register", {
          fullName,
          email,
          password,
          role,
        });
        const next = { user: data.user as User, accessToken: data.tokens.accessToken as string, refreshToken: data.tokens.refreshToken as string };
        saveSession(next);
        setSession(next);
        return next;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    if (session?.refreshToken) api.post("/auth/logout", { refreshToken: session.refreshToken }).catch(() => undefined);
    clearSession();
    setSession(null);
  }, [session]);

  return {
    session,
    loading,
    login,
    register,
    logout,
    errorMessage: getErrorMessage,
  };
}
