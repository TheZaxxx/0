import { User } from "@shared/schema";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  clear: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
  
  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};