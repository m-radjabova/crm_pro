import axios from "axios";
import type { Session, User } from "../types/crm";

const storageKey = "crm_acsess";
const refreshStorageKey = "crm_refresh";
const oldStorageKey = "crm_tokens";
const legacyStorageKey = "crm_session";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

let currentUser: User | null = null;

type StoredTokens = { accessToken: string; refreshToken: string };

const getStoredTokens = (): StoredTokens | null => {
  try {
    const accessToken = localStorage.getItem(storageKey);
    const refreshToken = localStorage.getItem(refreshStorageKey);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  } catch {
    return null;
  }
};

const saveTokens = ({ accessToken, refreshToken }: StoredTokens) => {
  localStorage.setItem(storageKey, accessToken);
  localStorage.setItem(refreshStorageKey, refreshToken);
  // Eski formatdagi access + refresh tokenlar saqlanib qolmasin.
  localStorage.removeItem(oldStorageKey);
  sessionStorage.removeItem(oldStorageKey);
  sessionStorage.removeItem(storageKey);
  sessionStorage.removeItem(refreshStorageKey);
};

const migrateLegacySession = () => {
  // Oldingi `crm_tokens` obyektidan faqat access tokenni olib qolamiz.
  if (!getStoredTokens()) {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const oldValue = storage.getItem(oldStorageKey);
        const oldTokens = oldValue ? (JSON.parse(oldValue) as { accessToken?: string; refreshToken?: string }) : null;
        if (oldTokens?.accessToken && oldTokens.refreshToken) {
          saveTokens({ accessToken: oldTokens.accessToken, refreshToken: oldTokens.refreshToken });
          break;
        }
      } catch {
        storage.removeItem(oldStorageKey);
      }
    }
  }
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const legacyValue = storage.getItem(legacyStorageKey);
      if (!legacyValue) continue;

      const legacySession = JSON.parse(legacyValue) as { tokens?: { accessToken?: string; refreshToken?: string } };
      if (!getStoredTokens() && legacySession.tokens?.accessToken && legacySession.tokens.refreshToken) {
        saveTokens({ accessToken: legacySession.tokens.accessToken, refreshToken: legacySession.tokens.refreshToken });
      }
      storage.removeItem(legacyStorageKey);
    } catch {
      storage.removeItem(legacyStorageKey);
    }
  }
};

migrateLegacySession();

export const hasSavedTokens = () => Boolean(getStoredTokens());

export const getSession = (): Session | null => {
  const tokens = getStoredTokens();
  return tokens && currentUser ? { ...tokens, user: currentUser } : null;
};

export const saveSession = (session: Session) => {
  currentUser = session.user;
  saveTokens(session);
  window.dispatchEvent(new Event("crm-session-changed"));
};

export const clearSession = () => {
  currentUser = null;
  localStorage.removeItem(storageKey);
  localStorage.removeItem(refreshStorageKey);
  sessionStorage.removeItem(storageKey);
  localStorage.removeItem(oldStorageKey);
  sessionStorage.removeItem(oldStorageKey);
  window.dispatchEvent(new Event("crm-session-changed"));
};

export const restoreSession = async (): Promise<Session | null> => {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  try {
    const { data } = await apiClient.get<{ user: User }>("/users/me");
    currentUser = data.user;
    return { user: data.user, ...(getStoredTokens() || tokens) };
  } catch {
    clearSession();
    return null;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredTokens()?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const tokens = getStoredTokens();
    if (error.response?.status !== 401 || original?._retry || !tokens?.refreshToken) return Promise.reject(error);
    original._retry = true;
    try {
      const { data } = await axios.post<{ tokens: StoredTokens }>(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken: tokens.refreshToken });
      saveTokens(data.tokens);
      original.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export const getErrorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || "So'rov bajarilmadi"
    : "Kutilmagan xatolik";

export default apiClient;
