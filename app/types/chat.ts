export type GeneratedFile = {
  id: string;
  fileType: string;
  mimeType: string;
  filename: string;
  path: string;
  url?: string;
  size: number;
};

export type ChatMessage = {
  role: 'ai' | 'user';
  content: string;
  generatedFiles?: GeneratedFile[];
  isLoading?: boolean;
};
