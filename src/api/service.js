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
  SERVER_STATS: '/api/admin/server/stats',
};

/**
 * @typedef {import('./types').ApiResponse} ApiResponse
 * @typedef {import('./types').LoginRequest} LoginRequest
 * @typedef {import('./types').User} User
 * @typedef {import('./types').Strategy} Strategy
 * @typedef {import('./types').AppConfig} AppConfig
 * @typedef {import('./types').ServerStats} ServerStats
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
 * GET /api/admin/server/stats
 * @returns {Promise<ServerStats>}
 */
export async function fetchServerStats() {
  const response = await apiClient.get(ENDPOINTS.SERVER_STATS);
  return unwrapData(response);
}

