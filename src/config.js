const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

export const API_BASE_URL = `${API_URL}/api`;
export const WS_BASE_URL = WS_URL;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  },
  PLANS: `${API_BASE_URL}/plans`,
  INVESTMENTS: `${API_BASE_URL}/investments`,
  DEPOSITS: `${API_BASE_URL}/deposits`,
  WITHDRAWALS: `${API_BASE_URL}/withdrawals`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  TRADING: `${API_BASE_URL}/trading`,
  LOANS: `${API_BASE_URL}/loans`,
  ADMIN: {
    BASE: `${API_BASE_URL}/admin`,
    STATS: `${API_BASE_URL}/admin/dashboard-stats`,
    USERS: `${API_BASE_URL}/admin/users`,
    DEPOSITS: `${API_BASE_URL}/admin/deposits`,
    WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
    TRADES: `${API_BASE_URL}/admin/trades`,
    MARKETS: `${API_BASE_URL}/admin/markets`,
    BANK_ACCOUNTS: `${API_BASE_URL}/admin/bank-accounts`,
    TICKETS: `${API_BASE_URL}/admin/tickets`,
    LOANS: `${API_BASE_URL}/admin/loans`,
    COINS: `${API_BASE_URL}/admin/coins`,
  },
};

export default {
  API_BASE_URL,
  WS_BASE_URL,
  ENDPOINTS,
};
