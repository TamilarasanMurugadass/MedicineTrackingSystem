import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, Bars3Icon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
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

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread alerts
  const fetchUnreadAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/alerts/unread`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const alerts = response.data;
      setUnreadAlerts(alerts);
      setUnreadCount(alerts.length);
    } catch (error) {
      console.error('Error fetching unread alerts:', error);
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/alerts/${alertId}/mark-read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh unread alerts
      fetchUnreadAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Handle alert click
  const handleAlertClick = async (alert: Alert) => {
    await markAlertAsRead(alert.id);
    navigate('/alerts');
    setIsNotificationOpen(false);
  };

  // Handle view all alerts
  const handleViewAllAlerts = () => {
    navigate('/alerts');
    setIsNotificationOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  // Fetch unread alerts on component mount
  useEffect(() => {
    if (user) {
      fetchUnreadAlerts();
      // Refresh alerts every 5 minutes
      const interval = setInterval(fetchUnreadAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open menu</span>
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Title */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900">
            Medicine Tracking System
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={handleNotificationClick}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
            </button>
            {/* Badge for unread notifications */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Notification dropdown */}
            {isNotificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsNotificationOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">
                        Notifications ({unreadCount})
                      </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {unreadAlerts.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          No unread notifications
                        </div>
                      ) : (
                        unreadAlerts.slice(0, 5).map((alert) => (
                          <button
                            key={alert.id}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => handleAlertClick(alert)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {alert.alertType === 'LowStock' ? (
                                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                                ) : alert.alertType === 'Expiry' ? (
                                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {alert.medicineName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(alert.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {unreadAlerts.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-200">
                        <button
                          className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-500"
                          onClick={handleViewAllAlerts}
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block ml-2">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </button>

            {/* Dropdown menu */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                    >
                      Your Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      Settings
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;