import axios, { AxiosHeaders, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getAccessToken, getSessionId } from "@/app/lib/authStore";

type RequestClientOptions = {
  baseURL: string;
  getAuthToken?: () => string | null;
  getSessionId?: () => string | null;
  defaultHeaders?: Record<string, string>;
  withCredentials?: boolean;
  refreshAccessToken?: () => Promise<boolean>;
};

type InternalRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

const defaultGetAuthToken = () => getAccessToken();
const defaultGetSessionId = () => getSessionId();

export class RequestClient {
  private client: AxiosInstance;
  private getAuthToken: () => string | null;
  private getSessionId: () => string | null;
  private refreshAccessToken?: () => Promise<boolean>;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(options: RequestClientOptions) {
    this.getAuthToken = options.getAuthToken ?? defaultGetAuthToken;
    this.getSessionId = options.getSessionId ?? defaultGetSessionId;
    this.refreshAccessToken = options.refreshAccessToken;
    this.client = axios.create({
      baseURL: options.baseURL,
      headers: options.defaultHeaders,
      withCredentials: options.withCredentials ?? true,
    });

    this.client.interceptors.request.use((config) => {
      const nextConfig = { ...config };
      const headers = AxiosHeaders.from(nextConfig.headers ?? {});

      const token = this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const sessionId = this.getSessionId();
      if (sessionId) {
        headers.set("X-Session-Id", sessionId);
      }

      nextConfig.headers = headers;
      return nextConfig;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!this.refreshAccessToken) {
          return Promise.reject(error);
        }

        const originalConfig = error.config as InternalRequestConfig;
        const status = error.response?.status;

        if (status !== 401 || originalConfig?._retry || originalConfig?._skipAuthRefresh) {
          return Promise.reject(error);
        }

        originalConfig._retry = true;

        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshAccessToken().finally(() => {
            this.refreshPromise = null;
          });
        }

        const refreshed = await this.refreshPromise;
        if (!refreshed) {
          return Promise.reject(error);
        }

        return this.client.request(originalConfig);
      },
    );
  }

  request<T>(config: InternalRequestConfig): Promise<T> {
    return this.client.request<T>(config).then((response) => response.data);
  }

  get<T>(url: string, config?: InternalRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  post<T, D = unknown>(url: string, data?: D, config?: InternalRequestConfig): Promise<T> {
    return this.request<T>({ ...config, url, method: "POST", data });
  }
}
