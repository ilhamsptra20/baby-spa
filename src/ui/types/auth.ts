export type UserRole = "admin" | "editor" | "viewer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt?: string;
}
