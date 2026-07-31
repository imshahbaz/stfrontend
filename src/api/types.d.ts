export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type Role = 'ADMIN' | (string & {});
export type Theme = 'LIGHT' | 'DARK' | (string & {});
export type TimeFrame = 'DAILY' | 'WEEKLY' | 'MONTHLY' | (string & {});

export interface User {
  userId: number;
  email: string;
  username: string;
  password: string;
  role: Role;
  theme: Theme;
  mobile: number;
  name: string;
  profile: string;
}

export interface Strategy {
  name: string;
  scanClause: string;
  active: boolean;
  successRate: number;
  timeFrame: TimeFrame;
}
