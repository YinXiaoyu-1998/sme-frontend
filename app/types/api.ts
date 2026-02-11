export type UploadFilesResponse = {
  count: number;
  files: {
    id: string;
    status: string;
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimeType: string;
  }[];
};
