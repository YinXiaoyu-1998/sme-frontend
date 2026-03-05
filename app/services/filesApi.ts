import { RequestClient } from "@/app/lib/request";
import type { UploadFilesResponse } from "@/app/types/api";

const backendBaseUrl = process.env.NEXT_PUBLIC_SME_BACKEND_URL ?? "";

const requestClient = new RequestClient({
  baseURL: backendBaseUrl,
  getAuthToken: () => null,
  getSessionId: () => null,
});

export class FilesApi {
  constructor(private request: RequestClient = requestClient) {}

  async listFiles(userId: string) {
    return this.request.get<UploadFilesResponse>("/files/list", {
      params: {
        userId,
      },
    });
  }

  async uploadFiles({ files, userId }: { files: File[]; userId: string }) {
    const formData = new FormData();
    formData.append("userId", userId);
    files.forEach((file) => {
      console.log('file', file);
      formData.append("files", file);
    });

    return this.request.post<UploadFilesResponse, FormData>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export const filesApi = new FilesApi();
