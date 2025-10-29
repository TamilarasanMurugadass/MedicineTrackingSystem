// Ensure API_BASE_URL always includes /api prefix
const getApiBaseUrl = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  // If the URL doesn't end with /api, add it
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,

  // User Management
  USERS: `${API_BASE_URL}/auth/users`,
  USERS_ACTIVE: `${API_BASE_URL}/auth/users/active`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/auth/users/${id}`,
  UPDATE_USER: (id: string) => `${API_BASE_URL}/auth/users/${id}`,
  CHANGE_PASSWORD: (id: string) => `${API_BASE_URL}/auth/users/${id}/change-password`,
  DEACTIVATE_USER: (id: string) => `${API_BASE_URL}/auth/users/${id}/deactivate`,
  ACTIVATE_USER: (id: string) => `${API_BASE_URL}/auth/users/${id}/activate`,

  // Medicines
  MEDICINES: `${API_BASE_URL}/medicines`,
  MEDICINES_SEARCH: `${API_BASE_URL}/medicines/search`,

  // Medicine Batches
  MEDICINE_BATCHES: `${API_BASE_URL}/medicinebatches`,

  // Inventory Transactions
  INVENTORY_TRANSACTIONS: `${API_BASE_URL}/inventory/transactions`,
  INVENTORY_WITHDRAW: `${API_BASE_URL}/inventory/withdraw`,
  INVENTORY_ADJUST: `${API_BASE_URL}/inventory/adjust-stock`,
  INVENTORY_MARK_EXPIRED: `${API_BASE_URL}/inventory/mark-expired`,
  INVENTORY_MARK_DAMAGED: `${API_BASE_URL}/inventory/mark-damaged`,

  // Alerts
  ALERTS: `${API_BASE_URL}/alerts`,
  ALERTS_SUMMARY: `${API_BASE_URL}/alerts/summary`,
  ALERTS_MARK_READ: `${API_BASE_URL}/alerts/mark-read`,

  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  DASHBOARD_STOCK_SUMMARY: `${API_BASE_URL}/dashboard/stock-summary`,
  DASHBOARD_RECENT_ACTIVITY: `${API_BASE_URL}/dashboard/recent-activity`,
  DASHBOARD_EXPIRY_WARNINGS: `${API_BASE_URL}/dashboard/expiry-warnings`,

  // Reports
  REPORTS_USAGE_SUMMARY: `${API_BASE_URL}/reports/usage-summary`,
  REPORTS_EXPORT_TRANSACTIONS: `${API_BASE_URL}/reports/export-transactions`,
  REPORTS_EXPORT_MEDICINES: `${API_BASE_URL}/reports/export-medicines`,

  // Roles
  ROLES: `${API_BASE_URL}/roles`,
};

export default API_BASE_URL;