import type { User } from "@/app/lib/authClient";

let accessToken: string | null = null;
let sessionId: string | null = null;
// TODO: Implement user system later. use fixed user for now.
let currentUser: User | null = null;
// let currentUser: User | null = {
//   id: 'testing-user',
//   email: 'test@test.com',
//   name: 'Test User',
//   isActive: true,
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
// };

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getSessionId = () => sessionId;

export const setSessionId = (nextSessionId: string | null) => {
  sessionId = nextSessionId;
};

export const getCurrentUser = () => currentUser;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const clearAuthState = () => {
  accessToken = null;
  sessionId = null;
  currentUser = null;
};
