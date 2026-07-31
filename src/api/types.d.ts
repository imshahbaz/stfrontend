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
export type TimeFrame =
  | 'FIVE_MINUTE'
  | 'FIFTEEN_MINUTE'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | (string & {});

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

export type StrategyInput = Strategy;

export interface GoogleAuthConfig {
  clientId: string;
  secret: string;
  callbackUrl: string;
  encryptionKey: string;
  geminiKey: string;
}

export interface AngelOneConfig {
  apiKey: string;
  clientId: string;
  password: string;
  seed: string;
}

export interface ServiceAccount {
  [key: string]: string;
}

export interface FcmConfig {
  serviceAccount: ServiceAccount;
}

export interface AuthFlags {
  google: boolean;
  email: boolean;
  trueCaller: boolean;
}

export interface ComponentFlags {
  heatMap: boolean;
}

export interface AppConfig {
  id: string;
  frontendUrls: string[];
  brevoEmail: string;
  brevoApiKey: string;
  apiKey: string;
  leverage: number;
  debugMode: boolean;
  rateLimiter: boolean;
  jwtSecret: string;
  redisUrl: string;
  googleAuth: GoogleAuthConfig | null;
  angelOneConfig: AngelOneConfig | null;
  fcmConfig: FcmConfig | null;
  auth: AuthFlags | null;
  components: ComponentFlags | null;
}
