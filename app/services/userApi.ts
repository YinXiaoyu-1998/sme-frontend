import {
  type AuthResponse,
  type User,
  authRequestClient,
  logoutWithRefreshCookie,
  refreshAccessToken,
} from "@/app/lib/authClient";
import { clearAuthState, setAccessToken, setCurrentUser } from "@/app/lib/authStore";
import type { RequestClient } from "@/app/lib/request";

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: User;
};

export type LogoutResponse = {
  success: boolean;
};

const requestClient = authRequestClient;

export class UserApi {
  constructor(private request: RequestClient = requestClient) {}

  async register(payload: RegisterRequest) {
    const response = await this.request.post<AuthResponse, RegisterRequest>(
      "/user/register",
      payload,
    );
    setAccessToken(response.accessToken);
    setCurrentUser(response.user);
    return response;
  }

  async login(payload: LoginRequest) {
    const response = await this.request.post<AuthResponse, LoginRequest>(
      "/user/login",
      payload,
    );
    setAccessToken(response.accessToken);
    setCurrentUser(response.user);
    return response;
  }

  async refresh() {
    const response = await refreshAccessToken();
    setCurrentUser(response.user);
    return response;
  }

  async logout() {
    const response = await logoutWithRefreshCookie();
    clearAuthState();
    return response;
  }

  async me() {
    const response = await this.request.get<{ user: User }>("/user/me");
    setCurrentUser(response.user);
    return response;
  }

  async deactivate() {
    return this.request.post<{ success: boolean }>("/user/deactivate");
  }

  async test() {
    return this.request.get<void>("/user/test");
  }
}

export const userApi = new UserApi();
