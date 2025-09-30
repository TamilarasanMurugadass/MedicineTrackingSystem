import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ClockIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

interface Alert {
  id: number;
  alertType: string;
  alertTypeDisplay: string;
  medicineId: number;
  medicineName: string;
  medicineBatchId?: number;
  batchNumber?: string;
  message: string;
  isRead: boolean;
  isActive: boolean;
  expiryDate?: string;
  currentStock?: number;
  minimumStock?: number;
  createdAt: string;
  readAt?: string;
  readBy?: string;
  readerName?: string;
  severity: string;
}

interface AlertSummary {
  totalAlerts: number;
  unreadAlerts: number;
  highSeverityAlerts: number;
  mediumSeverityAlerts: number;
  lowSeverityAlerts: number;
  lowStockAlerts: number;
  expiryAlerts: number;
  expiredAlerts: number;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts summary
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/alerts/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching alert summary:', error);
    }
  };

  // Fetch alerts based on filter
  const fetchAlerts = async (filterType: string = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let endpoint = `${API_BASE_URL}/alerts`;
      if (filterType === 'unread') {
        endpoint = `${API_BASE_URL}/alerts/unread`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let alertsData = response.data.data;

      if (filterType === 'read') {
        alertsData = alertsData.filter((alert: Alert) => alert.isRead);
      }

      setAlerts(alertsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  // Mark alert as read
  const markAsRead = async (alertId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/alerts/${alertId}/mark-read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the alert in the local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, isRead: true, readAt: new Date().toISOString() }
          : alert
      ));

      // Refresh summary
      fetchSummary();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Mark alert as unread
  const markAsUnread = async (alertId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/alerts/${alertId}/mark-unread`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the alert in the local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, isRead: false, readAt: undefined }
          : alert
      ));

      // Refresh summary
      fetchSummary();
    } catch (error) {
      console.error('Error marking alert as unread:', error);
    }
  };

  // Get alert icon
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'LowStock':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
      case 'Expiry':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'Expired':
        return <XMarkIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-700 bg-red-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter);
    fetchAlerts(newFilter);
  };

  // Load data on component mount
  useEffect(() => {
    fetchAlerts();
    fetchSummary();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
        <p className="mt-2 text-gray-600">Monitor and manage system notifications and alerts.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Total Alerts</p>
                <p className="text-lg font-bold text-blue-900">{summary.totalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Unread Alerts</p>
                <p className="text-lg font-bold text-red-900">{summary.unreadAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-800">Low Stock</p>
                <p className="text-lg font-bold text-orange-900">{summary.lowStockAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Expiry Alerts</p>
                <p className="text-lg font-bold text-yellow-900">{summary.expiryAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {['all', 'unread', 'read'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => handleFilterChange(filterOption as 'all' | 'unread' | 'read')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === filterOption
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} Alerts
            </button>
          ))}
        </nav>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No alerts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.isRead
                  ? 'bg-gray-50 border-l-gray-300'
                  : 'bg-white border-l-primary-500 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    {getAlertIcon(alert.alertType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {alert.medicineName}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {alert.alertTypeDisplay}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                      {alert.batchNumber && <span>Batch: {alert.batchNumber}</span>}
                      {alert.currentStock && <span>Stock: {alert.currentStock}</span>}
                      {alert.expiryDate && (
                        <span>Expires: {new Date(alert.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {alert.isRead && alert.readAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Read on {new Date(alert.readAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.isRead ? (
                    <button
                      onClick={() => markAsUnread(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Mark as unread"
                    >
                      <EyeSlashIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;