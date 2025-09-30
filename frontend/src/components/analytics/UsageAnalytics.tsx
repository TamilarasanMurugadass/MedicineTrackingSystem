import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';

interface UsageAnalyticsProps {
  totalMedicines: number;
  totalTransactions: number;
  mostUsedMedicine: {
    name: string;
    usage: number;
  } | null;
  leastUsedMedicine: {
    name: string;
    usage: number;
  } | null;
  expiringBatches: number;
  lowStockBatches: number;
  averageUsagePerDay: number;
  usageTrend: 'up' | 'down' | 'stable';
}

const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({
  totalMedicines,
  totalTransactions,
  mostUsedMedicine,
  leastUsedMedicine,
  expiringBatches,
  lowStockBatches,
  averageUsagePerDay,
  usageTrend,
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Medicines */}
      <Card>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Medicines
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {totalMedicines}
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      {/* Total Transactions */}
      <Card>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Transactions
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {totalTransactions}
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      {/* Average Daily Usage */}
      <Card>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              {getTrendIcon(usageTrend)}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Daily Average
              </dt>
              <dd className={`text-lg font-medium ${getTrendColor(usageTrend)}`}>
                {averageUsagePerDay.toFixed(1)} units
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Alerts
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {expiringBatches + lowStockBatches}
              </dd>
              <dd className="text-xs text-gray-500">
                {expiringBatches} expiring, {lowStockBatches} low stock
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      {/* Most Used Medicine */}
      <Card className="md:col-span-2">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Most Used Medicine</h3>
          {mostUsedMedicine ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{mostUsedMedicine.name}</p>
                <p className="text-sm text-gray-500">Used {mostUsedMedicine.usage} times</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Most Active
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No usage data available</p>
          )}
        </div>
      </Card>

      {/* Least Used Medicine */}
      <Card className="md:col-span-2">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Least Used Medicine</h3>
          {leastUsedMedicine ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{leastUsedMedicine.name}</p>
                <p className="text-sm text-gray-500">Used {leastUsedMedicine.usage} times</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Review Stock
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No usage data available</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UsageAnalytics;