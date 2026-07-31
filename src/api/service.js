import apiClient from './client';

export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  STRATEGIES: '/api/strategy/admin',
  STRATEGY: '/api/strategy',
};

/**
 * @typedef {import('./types').ApiResponse} ApiResponse
 * @typedef {import('./types').LoginRequest} LoginRequest
 * @typedef {import('./types').User} User
 * @typedef {import('./types').Strategy} Strategy
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
