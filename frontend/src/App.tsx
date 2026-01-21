import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MedicinesPage from './pages/medicines/MedicinesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import UsageTrackingPage from './pages/usage/UsageTrackingPage';
import AlertsPage from './pages/alerts/AlertsPage';
import ReportsPage from './pages/reports/ReportsPage';
import ProfilePage from './pages/profile/ProfilePage';
import UserManagementPage from './pages/users/UserManagementPage';
import { Role } from './types';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />

              {/* Medicine Management */}
              <Route path="medicines" element={<MedicinesPage />} />

              {/* Inventory Management */}
              <Route path="inventory" element={<InventoryPage />} />

              {/* Transactions */}
              <Route path="transactions" element={<TransactionsPage />} />

              {/* Usage Tracking */}
              <Route path="usage" element={<UsageTrackingPage />} />

              {/* Alerts */}
              <Route path="alerts" element={<AlertsPage />} />

              {/* Reports */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* User Management - Admin only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRoles={[Role.ADMIN]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="settings"
                element={
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <p className="mt-2 text-gray-600">Configure system settings and preferences.</p>
                    <div className="mt-8 text-center py-12">
                      <p className="text-gray-500">Settings features coming soon...</p>
                    </div>
                  </div>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">404 - Page Not Found</h2>
                      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                      <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
