import apiClient from './client';

/* ==========================================================================
   ENDPOINT CONSTANTS BY CATEGORY
   ========================================================================== */

/** Authentication Endpoints */
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
};

/** Strategy & Algorithmic Trading Endpoints */
export const STRATEGY_ENDPOINTS = {
  STRATEGIES: '/api/admin/strategy/admin',
  STRATEGY: '/api/admin/strategy',
  WARMUP: '/api/strategy-trading/warmup',
};

/** Configuration Management Endpoints */
export const CONFIG_ENDPOINTS = {
  CLIENT_CONFIG: '/api/config/client/active',
  BACKEND_CONFIG: '/api/admin/config/active',
  CONFIG_RELOAD: '/api/admin/config/reload',
  CLIENT_CONFIG_RELOAD: '/api/admin/config/client/reload',
  CONFIG_UPDATE: '/api/admin/config/update',
};

/** Schedule & Task Management Endpoints */
export const SCHEDULE_ENDPOINTS = {
  SCHEDULE_ALL: '/api/admin/schedule/all',
  SCHEDULE_CRON: '/api/admin/schedule/cron',
  SCHEDULE_TASK: '/api/admin/schedule',
};

/** Market & Margin Data Endpoints */
export const MARKET_ENDPOINTS = {
  MARGIN_ALL: '/api/margin/all',
  MARKET_BAR_SERIES: '/api/market/bar-series',
};

/** System & Server Endpoints */
export const SERVER_ENDPOINTS = {
  SERVER_STATS: '/api/admin/server/stats',
};

/** Chartink / Scanner Endpoints */
export const SCANNER_ENDPOINTS = {
  FETCH_WITH_MARGIN: '/api/chartink/fetchWithMargin',
  BACKTEST_WITH_MARGIN: '/api/chartink/backtestWithMargin',
};

/** Broker Management Endpoints */
export const BROKER_ENDPOINTS = {
  REVOKE_AUTH: '/api/session-manager/broker/revoke-auth',
};




/* ==========================================================================
   TYPE DEFINITIONS & HELPERS
   ========================================================================== */

/**
 * @typedef {import('./types').ApiResponse} ApiResponse
 * @typedef {import('./types').LoginRequest} LoginRequest
 * @typedef {import('./types').User} User
 * @typedef {import('./types').Strategy} Strategy
 * @typedef {import('./types').StrategyInput} StrategyInput
 * @typedef {import('./types').AppConfig} AppConfig
 * @typedef {import('./types').ServerStats} ServerStats
 * @typedef {import('./types').MarginData} MarginData
 * @typedef {import('./types').ScheduleTask} ScheduleTask
 * @typedef {import('./types').ScannerResultItem} ScannerResultItem
 * @typedef {import('./types').BacktestWithMarginResult} BacktestWithMarginResult
 */

/**
 * Helper to unwrap standard ApiResponse wrapper
 * @template T
 * @param {import('axios').AxiosResponse<ApiResponse<T>>} response
 * @returns {T}
 */
function unwrapData(response) {
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || body.error || 'Request failed');
  }
  return body.data;
}

/* ==========================================================================
   1. AUTHENTICATION SERVICES
   ========================================================================== */

/**
 * POST /api/auth/login
 * @param {LoginRequest} payload
 * @returns {Promise<User>}
 */
export async function login(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, payload);
  return unwrapData(response);
}

/**
 * POST /api/auth/logout
 * @returns {Promise<void>}
 */
export async function logout() {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  return unwrapData(response);
}

/**
 * GET /api/auth/me
 * @returns {Promise<User>}
 */
export async function fetchCurrentUser() {
  const response = await apiClient.get(AUTH_ENDPOINTS.ME);
  return unwrapData(response);
}

/* ==========================================================================
   2. STRATEGY & TRADING SERVICES
   ========================================================================== */

/**
 * GET /api/strategy/admin
 * @returns {Promise<Strategy[]>}
 */
export async function fetchStrategies() {
  const response = await apiClient.get(STRATEGY_ENDPOINTS.STRATEGIES);
  return unwrapData(response);
}

/**
 * POST /api/strategy
 * @param {StrategyInput} payload
 * @returns {Promise<Strategy>}
 */
export async function createStrategy(payload) {
  const response = await apiClient.post(STRATEGY_ENDPOINTS.STRATEGY, payload);
  return unwrapData(response);
}

/**
 * PUT /api/strategy
 * @param {StrategyInput} payload
 * @returns {Promise<Strategy>}
 */
export async function updateStrategy(payload) {
  const response = await apiClient.put(STRATEGY_ENDPOINTS.STRATEGY, payload);
  return unwrapData(response);
}

/**
 * DELETE /api/strategy?id=<id>
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function deleteStrategy(id) {
  const response = await apiClient.delete(STRATEGY_ENDPOINTS.STRATEGY, { params: { id } });
  return unwrapData(response);
}

/**
 * POST /api/strategy-trading/warmup
 * @returns {Promise<any>}
 */
export async function warmupStrategyTrading() {
  const response = await apiClient.post(STRATEGY_ENDPOINTS.WARMUP);
  return unwrapData(response);
}

/* ==========================================================================
   3. CONFIGURATION MANAGEMENT SERVICES
   ========================================================================== */

/**
 * GET /api/config/client/active
 * @returns {Promise<AppConfig>}
 */
export async function fetchClientConfig() {
  const response = await apiClient.get(CONFIG_ENDPOINTS.CLIENT_CONFIG);
  return unwrapData(response);
}

/**
 * GET /api/config/active
 * @returns {Promise<AppConfig>}
 */
export async function fetchBackendConfig() {
  const response = await apiClient.get(CONFIG_ENDPOINTS.BACKEND_CONFIG);
  return unwrapData(response);
}

/**
 * POST /api/config/reload
 * @returns {Promise<string>}
 */
export async function reloadConfig() {
  const response = await apiClient.post(CONFIG_ENDPOINTS.CONFIG_RELOAD);
  return unwrapData(response);
}

/**
 * POST /api/admin/config/client/reload
 * @returns {Promise<string>}
 */
export async function reloadClientConfig() {
  const response = await apiClient.post(CONFIG_ENDPOINTS.CLIENT_CONFIG_RELOAD);
  return unwrapData(response);
}

/**
 * PUT /api/admin/config/update/{id}
 * @param {string} id
 * @param {Record<string, any>} payload
 * @returns {Promise<AppConfig>}
 */
export async function updateConfig(id, payload) {
  const response = await apiClient.put(`${CONFIG_ENDPOINTS.CONFIG_UPDATE}/${id}`, payload);
  return unwrapData(response);
}

/* ==========================================================================
   4. SCHEDULE & TASK MANAGEMENT SERVICES
   ========================================================================== */

/**
 * GET /api/schedule/all?tasktType={type}
 * @param {string} taskType
 * @returns {Promise<ScheduleTask[]>}
 */
export async function fetchScheduleTasks(taskType) {
  const response = await apiClient.get(SCHEDULE_ENDPOINTS.SCHEDULE_ALL, { params: { taskType: taskType } });
  return unwrapData(response);
}

/**
 * POST /api/schedule/cron
 * @param {import('./types').CronTaskDto} data
 * @returns {Promise<unknown>}
 */
export async function createCronSchedule(data) {
  const response = await apiClient.post(SCHEDULE_ENDPOINTS.SCHEDULE_CRON, data);
  return unwrapData(response);
}

/**
 * POST /api/schedule
 * @param {import('./types').ScheduledTaskDto} data
 * @returns {Promise<unknown>}
 */
export async function createOneTimeSchedule(data) {
  const response = await apiClient.post(SCHEDULE_ENDPOINTS.SCHEDULE_TASK, data);
  return unwrapData(response);
}

/**
 * DELETE /api/admin/schedule?id={id}
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteOneTimeSchedule(id) {
  const response = await apiClient.delete(SCHEDULE_ENDPOINTS.SCHEDULE_TASK, { params: { id } });
  return unwrapData(response);
}

/**
 * PUT /api/admin/schedule/cron/{id}
 * @param {string} id
 * @param {import('./types').CronTaskDto} data
 * @returns {Promise<unknown>}
 */
export async function updateCronSchedule(id, data) {
  const response = await apiClient.put(`${SCHEDULE_ENDPOINTS.SCHEDULE_CRON}/${id}`, data);
  return unwrapData(response);
}

/**
 * DELETE /api/admin/schedule/cron?id={id}
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteCronSchedule(id) {
  const response = await apiClient.delete(SCHEDULE_ENDPOINTS.SCHEDULE_CRON, { params: { id } });
  return unwrapData(response);
}

/* ==========================================================================
   5. MARKET & MARGIN DATA SERVICES
   ========================================================================== */

/**
 * GET /api/margin/all
 * @returns {Promise<MarginData[]>}
 */
export async function fetchMarginData() {
  const response = await apiClient.get(MARKET_ENDPOINTS.MARGIN_ALL);
  return unwrapData(response);
}

/**
 * GET /api/market/bar-series/{symbol}
 * @param {string} symbol
 * @returns {Promise<unknown>}
 */
export async function fetchMarketBarSeries(symbol) {
  const response = await apiClient.get(`${MARKET_ENDPOINTS.MARKET_BAR_SERIES}/${encodeURIComponent(symbol)}`);
  return unwrapData(response);
}

/* ==========================================================================
   6. SERVER & SYSTEM SERVICES
   ========================================================================== */

/**
 * GET /api/admin/server/stats
 * @returns {Promise<ServerStats>}
 */
export async function fetchServerStats() {
  const response = await apiClient.get(SERVER_ENDPOINTS.SERVER_STATS);
  return unwrapData(response);
}

/* ==========================================================================
   7. SCANNER SERVICES
   ========================================================================== */

/**
 * GET /api/chartink/fetchWithMargin?strategy={strategy}
 * @param {string} strategy
 * @returns {Promise<ScannerResultItem[]>}
 */
export async function fetchStrategyWithMargin(strategy) {
  const response = await apiClient.get(SCANNER_ENDPOINTS.FETCH_WITH_MARGIN, {
    params: { strategy },
  });
  return unwrapData(response);
}

/**
 * GET /api/chartink/backtestWithMargin?strategy={strategy}
 * @param {string} strategy
 * @returns {Promise<BacktestWithMarginResult[]>}
 */
export async function fetchStrategyBacktestWithMargin(strategy) {
  const response = await apiClient.get(SCANNER_ENDPOINTS.BACKTEST_WITH_MARGIN, {
    params: { strategy },
  });
  return unwrapData(response);
}

/* ==========================================================================
   8. BROKER MANAGEMENT SERVICES
   ========================================================================== */

/**
 * POST /api/session-manager/broker/revoke-auth?userId={userId}&brokerType={brokerType}
 * @param {number|string} userId
 * @param {'ZERODHA' | 'RUPEEZY'} brokerType
 * @returns {Promise<any>}
 */
export async function revokeBrokerAuth(userId, brokerType) {
  const response = await apiClient.post(BROKER_ENDPOINTS.REVOKE_AUTH, null, {
    params: { userId, brokerType },
  });
  return unwrapData(response);
}


