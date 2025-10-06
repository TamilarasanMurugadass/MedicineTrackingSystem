import React from 'react';
import { Link } from 'react-router-dom';
import {
  BeakerIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { useAuth } from '../../contexts/AuthContext';
import { useMedicines } from '../../hooks/useMedicines';
import { useInventoryTransactions } from '../../hooks/useInventoryTransactions';
import { useMedicineBatches } from '../../hooks/useMedicineBatches';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { medicines, isLoading: medicinesLoading } = useMedicines();
  const { transactions, isLoading: transactionsLoading } = useInventoryTransactions();
  const { batches, isLoading: batchesLoading } = useMedicineBatches();

  const isLoading = medicinesLoading || transactionsLoading || batchesLoading;

  // Calculate dashboard metrics
  const totalMedicines = medicines.length;
  const lowStockBatches = batches.filter(batch => batch.usagePercentage > 80 && !batch.isDepleted).length;
  const expiredBatches = batches.filter(batch => batch.isExpired).length;
  const expiringBatches = batches.filter(batch => batch.isNearingExpiry && !batch.isExpired).length;
  const activeBatches = batches.filter(batch => !batch.isDepleted && !batch.isExpired).length;
  const totalTransactions = transactions.length;

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Critical alerts
  const criticalAlerts = [
    ...batches
      .filter(batch => batch.isExpired)
      .map(batch => ({
        id: `expired-${batch.id}`,
        type: 'Expired Batch',
        message: `${batch.medicineName} batch ${batch.batchNumber} has expired`,
        severity: 'high' as const,
        date: batch.expiryDate,
      })),
    ...batches
      .filter(batch => batch.isNearingExpiry && !batch.isExpired)
      .slice(0, 3)
      .map(batch => ({
        id: `expiring-${batch.id}`,
        type: 'Expiring Soon',
        message: `${batch.medicineName} batch ${batch.batchNumber} expires in ${batch.daysToExpiry} days`,
        severity: 'medium' as const,
        date: batch.expiryDate,
      })),
    ...batches
      .filter(batch => batch.usagePercentage > 90 && !batch.isDepleted)
      .slice(0, 2)
      .map(batch => ({
        id: `low-stock-${batch.id}`,
        type: 'Low Stock',
        message: `${batch.medicineName} batch ${batch.batchNumber} is running low (${batch.currentQuantity} units)`,
        severity: 'medium' as const,
        date: new Date().toISOString(),
      })),
  ].slice(0, 5);

  // Usage trend (simple calculation)
  const last7DaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return transactionDate >= sevenDaysAgo && t.isStockReduction;
  });

  const previous7DaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return transactionDate >= fourteenDaysAgo && transactionDate < sevenDaysAgo && t.isStockReduction;
  });

  const currentUsage = last7DaysTransactions.reduce((sum, t) => sum + t.quantity, 0);
  const previousUsage = previous7DaysTransactions.reduce((sum, t) => sum + t.quantity, 0);
  const usageTrend = previousUsage > 0 ? ((currentUsage - previousUsage) / previousUsage) * 100 : 0;

  const getAlertIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Here's what's happening with your medicine inventory today.
            </p>
          </div>
          <div className="hidden sm:flex space-x-3">
            <Link to="/usage">
              <Button variant="outline" leftIcon={<ChartPieIcon className="h-4 w-4" />}>
                View Analytics
              </Button>
            </Link>
            <Link to="/reports">
              <Button leftIcon={<ChartBarIcon className="h-4 w-4" />}>
                Generate Report
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BeakerIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Medicines
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{totalMedicines}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Low Stock Items
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{lowStockBatches}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Expired Batches
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{expiredBatches}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Batches
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{activeBatches}</dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalTransactions}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
            </div>
            <ArrowsRightLeftIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentUsage}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Usage This Week</div>
            </div>
            <div className="flex items-center">
              <ArrowTrendingUpIcon className={`h-5 w-5 ${usageTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ml-1 ${usageTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {usageTrend >= 0 ? '+' : ''}{usageTrend.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{expiringBatches}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</div>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              <Link to="/transactions">
                <Button variant="outline" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </div>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No recent activity
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.isStockAddition ? 'bg-green-500' :
                      transaction.isStockReduction ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.transactionTypeDisplay} - {transaction.medicineName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.isStockAddition ? '+' : '-'}{transaction.quantity} units • {transaction.creatorName}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alerts */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Critical Alerts</h3>
              <Link to="/alerts">
                <Button variant="outline" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </div>
          </div>
          {criticalAlerts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No critical alerts
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className={`px-6 py-4 ${getAlertBgColor(alert.severity)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.type}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(alert.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/medicines">
            <Button variant="outline" className="w-full justify-center" leftIcon={<BeakerIcon className="h-4 w-4" />}>
              Add Medicine
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline" className="w-full justify-center" leftIcon={<CubeIcon className="h-4 w-4" />}>
              Manage Inventory
            </Button>
          </Link>
          <Link to="/usage">
            <Button variant="outline" className="w-full justify-center" leftIcon={<ChartPieIcon className="h-4 w-4" />}>
              View Usage
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" className="w-full justify-center" leftIcon={<ChartBarIcon className="h-4 w-4" />}>
              Generate Report
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;