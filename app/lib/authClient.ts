import { clearAuthState, setAccessToken } from "@/app/lib/authStore";
import { RequestClient } from "@/app/lib/request";

export type User = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: User;
};

const backendBaseUrl = process.env.NEXT_PUBLIC_SME_BACKEND_URL ?? "";

const refreshClient = new RequestClient({
  baseURL: backendBaseUrl,
  getAuthToken: () => null,
  getSessionId: () => null,
});

export const authRequestClient = new RequestClient({
  baseURL: backendBaseUrl,
  refreshAccessToken: async () => {
    try {
      const response = await refreshClient.post<AuthResponse>(
        "/user/refresh",
        undefined,
        { _skipAuthRefresh: true },
      );
      setAccessToken(response.accessToken);
      return true;
    } catch {
      clearAuthState();
      return false;
    }
  },
});

export const refreshAccessToken = () =>
  refreshClient
    .post<AuthResponse>("/user/refresh", undefined, { _skipAuthRefresh: true })
    .then((response) => {
      setAccessToken(response.accessToken);
      return response;
    });

export const logoutWithRefreshCookie = () =>
  refreshClient.post<{ success: boolean }>("/user/logout", undefined, {
    _skipAuthRefresh: true,
  });
