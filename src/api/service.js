import apiClient from './client';

export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  STRATEGIES: '/api/admin/strategy/admin',
  STRATEGY: '/api/admin/strategy',
  CLIENT_CONFIG: '/api/config/client/active',
  BACKEND_CONFIG: '/api/admin/config/active',
  CONFIG_RELOAD: '/api/admin/config/reload',
  CLIENT_CONFIG_RELOAD: '/api/admin/config/client/reload',
  CONFIG_UPDATE: '/api/admin/config/update',
  SERVER_STATS: '/api/admin/server/stats',
  MARGIN_ALL: '/api/margin/all',
  MARKET_BAR_SERIES: '/api/market/bar-series',
  SCHEDULE_ALL: '/api/admin/schedule/all',
  SCHEDULE_CRON: '/api/admin/schedule/cron',
  SCHEDULE_TASK: '/api/admin/schedule',
  STRATEGY_TRADING_WARMUP: '/api/strategy-trading/warmup',
};

/**
 * @typedef {import('./types').ApiResponse} ApiResponse
 * @typedef {import('./types').LoginRequest} LoginRequest
 * @typedef {import('./types').User} User
 * @typedef {import('./types').Strategy} Strategy
 * @typedef {import('./types').AppConfig} AppConfig
 * @typedef {import('./types').ServerStats} ServerStats
 * @typedef {import('./types').MarginData} MarginData
 * @typedef {import('./types').ScheduleTask} ScheduleTask
 */

/**
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

/**
 * POST /api/auth/login
 * @param {LoginRequest} payload
 * @returns {Promise<User>}
 */
export async function login(payload) {
  const response = await apiClient.post(ENDPOINTS.LOGIN, payload);
  return unwrapData(response);
}

/**
 * POST /api/auth/logout
 * @returns {Promise<void>}
 */
export async function logout() {
  const response = await apiClient.post(ENDPOINTS.LOGOUT);
  return unwrapData(response);
}

/**
 * GET /api/auth/me
 * @returns {Promise<User>}
 */
export async function fetchCurrentUser() {
  const response = await apiClient.get(ENDPOINTS.ME);
  return unwrapData(response);
}

/**
 * GET /api/strategy/admin
 * @returns {Promise<Strategy[]>}
 */
export async function fetchStrategies() {
  const response = await apiClient.get(ENDPOINTS.STRATEGIES);
  return unwrapData(response);
}

/**
 * POST /api/strategy
 * @param {StrategyInput} payload
 * @returns {Promise<Strategy>}
 */
export async function createStrategy(payload) {
  const response = await apiClient.post(ENDPOINTS.STRATEGY, payload);
  return unwrapData(response);
}

/**
 * PUT /api/strategy
 * @param {StrategyInput} payload
 * @returns {Promise<Strategy>}
 */
export async function updateStrategy(payload) {
  const response = await apiClient.put(ENDPOINTS.STRATEGY, payload);
  return unwrapData(response);
}

/**
 * DELETE /api/strategy?id=<id>
 * @param {string} id
 * @returns {Promise<string>}
 */
export async function deleteStrategy(id) {
  const response = await apiClient.delete(ENDPOINTS.STRATEGY, { params: { id } });
  return unwrapData(response);
}

/**
 * GET /api/config/client/active
 * @returns {Promise<AppConfig>}
 */
export async function fetchClientConfig() {
  const response = await apiClient.get(ENDPOINTS.CLIENT_CONFIG);
  return unwrapData(response);
}

/**
 * GET /api/config/active
 * @returns {Promise<AppConfig>}
 */
export async function fetchBackendConfig() {
  const response = await apiClient.get(ENDPOINTS.BACKEND_CONFIG);
  return unwrapData(response);
}

/**
 * POST /api/config/reload
 * @returns {Promise<string>}
 */
export async function reloadConfig() {
  const response = await apiClient.post(ENDPOINTS.CONFIG_RELOAD);
  return unwrapData(response);
}

/**
 * POST /api/admin/config/client/reload
 * @returns {Promise<string>}
 */
export async function reloadClientConfig() {
  const response = await apiClient.post(ENDPOINTS.CLIENT_CONFIG_RELOAD);
  return unwrapData(response);
}

/**
 * PUT /api/admin/config/update/{id}
 * @param {string} id
 * @param {Record<string, any>} payload
 * @returns {Promise<AppConfig>}
 */
export async function updateConfig(id, payload) {
  const response = await apiClient.put(`${ENDPOINTS.CONFIG_UPDATE}/${id}`, payload);
  return unwrapData(response);
}

/**
 * GET /api/admin/server/stats
 * @returns {Promise<ServerStats>}
 */
export async function fetchServerStats() {
  const response = await apiClient.get(ENDPOINTS.SERVER_STATS);
  return unwrapData(response);
}

/**
 * GET /api/margin/all
 * @returns {Promise<MarginData[]>}
 */
export async function fetchMarginData() {
  const response = await apiClient.get(ENDPOINTS.MARGIN_ALL);
  return unwrapData(response);
}

/**
 * GET /api/market/bar-series/{symbol}
 * @param {string} symbol
 * @returns {Promise<unknown>}
 */
export async function fetchMarketBarSeries(symbol) {
  const response = await apiClient.get(`${ENDPOINTS.MARKET_BAR_SERIES}/${encodeURIComponent(symbol)}`);
  return unwrapData(response);
}

/**
 * GET /api/schedule/all?tasktType={type}
 * @param {string} taskType
 * @returns {Promise<ScheduleTask[]>}
 */
export async function fetchScheduleTasks(taskType) {
  const response = await apiClient.get(ENDPOINTS.SCHEDULE_ALL, { params: { taskType: taskType } });
  return unwrapData(response);
}

/**
 * POST /api/schedule/cron
 * @param {import('./types').CronTaskDto} data
 * @returns {Promise<unknown>}
 */
export async function createCronSchedule(data) {
  const response = await apiClient.post(ENDPOINTS.SCHEDULE_CRON, data);
  return unwrapData(response);
}

/**
 * POST /api/schedule
 * @param {import('./types').ScheduledTaskDto} data
 * @returns {Promise<unknown>}
 */
export async function createOneTimeSchedule(data) {
  const response = await apiClient.post(ENDPOINTS.SCHEDULE_TASK, data);
  return unwrapData(response);
}

/**
 * POST /api/strategy-trading/warmup
 * @returns {Promise<any>}
 */
export async function warmupStrategyTrading() {
  const response = await apiClient.post(ENDPOINTS.STRATEGY_TRADING_WARMUP);
  return unwrapData(response);
}

/**
 * DELETE /api/admin/schedule?id={id}
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteOneTimeSchedule(id) {
  const response = await apiClient.delete(ENDPOINTS.SCHEDULE_TASK, { params: { id } });
  return unwrapData(response);
}

/**
 * DELETE /api/admin/schedule/cron?id={id}
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteCronSchedule(id) {
  const response = await apiClient.delete(ENDPOINTS.SCHEDULE_CRON, { params: { id } });
  return unwrapData(response);
}

