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

export interface ScannerResultItem {
  name: string;
  symbol: string;
  margin: number;
  rupeezyMargin: number;
  close: number;
}

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

export interface ServerMemoryStats {
  heapUsedMb: number;
  heapCommittedMb: number;
  heapMaxMb: number;
  heapUsedPercent: number;
  nonHeapUsedMb: number;
  nonHeapCommittedMb: number;
}

export interface ServerCpuStats {
  processCpuPercent: number;
  systemCpuPercent: number;
  systemLoadAverage: number;
  availableProcessors: number;
}

export interface ServerThreadStats {
  live: number;
  daemon: number;
  peak: number;
  totalStarted: number;
}

export interface ServerRuntimeStats {
  uptimeMs: number;
  startTimeEpochMs: number;
}

export interface ServerFileDescriptorStats {
  open: number;
  max: number;
}

export interface ServerGcStats {
  name: string;
  collectionCount: number;
  collectionTimeMs: number;
}

export interface ServerMemoryPoolStats {
  name: string;
  usedMb: number;
  committedMb: number;
  maxMb: number;
}

export interface ServerBufferPoolStats {
  name: string;
  count: number;
  memoryUsedMb: number;
  totalCapacityMb: number;
}

export interface PipelineDomainStats {
  ringBufferSize: number;
  shardCount: number;
  ringRemainingCapacity: number;
  ringUsedSlots: number;
}

export interface WatchdogDomainStats {
  watchedTokens: number;
  watchedTrades: number;
  mtfWatchedTokens: number;
  mtfWatchedTrades: number;
  inFlightTriggers: number;
  inFlightMtfTriggers: number;
}

export interface WebSocketDomainStats {
  connected: boolean;
  reconnectAttempts: number;
}

export interface ServerDomainStats {
  pipeline: PipelineDomainStats;
  watchdog: WatchdogDomainStats;
  webSocket: WebSocketDomainStats;
}

export interface MarginData {
  symbol: string;
  name: string;
  requiredMargin: number;
  token: string;
  rupeezyMargin: number;
}

export interface ScheduleCallback {
  url: string;
  httpMethod: string;
  body: string | null;
  headers: Record<string, string> | null;
}

export interface CronTaskDto {
  cronId: string;
  callBack: ScheduleCallback | null;
  cronExpression: string;
  type: 'CRON';
}

export interface ScheduledTaskDto {
  taskId: string;
  callBack: ScheduleCallback | null;
  executionTime: number;
  type: 'TASK';
}

export type ScheduleTask = CronTaskDto | ScheduledTaskDto;

export interface ServerStats {
  memory: ServerMemoryStats;
  cpu: ServerCpuStats;
  threads: ServerThreadStats;
  runtime: ServerRuntimeStats;
  fileDescriptors: ServerFileDescriptorStats;
  gc: ServerGcStats[];
  memoryPools: ServerMemoryPoolStats[];
  bufferPools: ServerBufferPoolStats[];
  domain: ServerDomainStats;
}

