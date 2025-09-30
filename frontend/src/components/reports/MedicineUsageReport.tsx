import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/Table';
import Card from '../ui/Card';
import { CalendarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';

interface UsageTransaction {
  id: number;
  date: string;
  quantity: number;
  reason: string;
  patientReference?: string;
  userName: string;
  batchNumber: string;
  remainingQuantity: number;
}

interface MedicineUsageDetails {
  medicineId: number;
  medicineName: string;
  totalUsage: number;
  averageDailyUsage: number;
  peakUsageMonth: string;
  lowUsageMonth: string;
  usageByDay: Record<string, number>;
  usageByMonth: Record<string, number>;
  currentStock: number;
  totalBatches: number;
  activeBatches: number;
  recentTransactions: UsageTransaction[];
  usageTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  seasonalPattern: {
    highSeason: string;
    lowSeason: string;
  };
  recommendedReorderLevel: number;
  projectedStockDepletion: string | null;
}

interface MedicineUsageReportProps {
  medicineUsage: MedicineUsageDetails;
  isLoading?: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

const MedicineUsageReport: React.FC<MedicineUsageReportProps> = ({
  medicineUsage,
  isLoading = false,
  dateRange,
}) => {
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  const getDayOfWeek = (day: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[parseInt(day)];
  };

  const getMonthName = (month: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(month) - 1];
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColorClass = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{medicineUsage.medicineName}</h2>
            <p className="text-sm text-gray-600">
              Usage report for {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(medicineUsage.usageTrend.direction)}
            <span className={`text-sm font-medium ${getTrendColorClass(medicineUsage.usageTrend.direction)}`}>
              {medicineUsage.usageTrend.percentage > 0 ? '+' : ''}{medicineUsage.usageTrend.percentage}%
            </span>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{medicineUsage.totalUsage}</div>
            <div className="text-sm text-gray-500">Total Units Used</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{medicineUsage.averageDailyUsage.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Avg Daily Usage</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{medicineUsage.currentStock}</div>
            <div className="text-sm text-gray-500">Current Stock</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{medicineUsage.activeBatches}</div>
            <div className="text-sm text-gray-500">Active Batches</div>
          </div>
        </Card>
      </div>

      {/* Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Pattern */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Usage Pattern</h3>
          <div className="space-y-3">
            {Object.entries(medicineUsage.usageByDay).map(([day, usage]) => {
              const maxUsage = Math.max(...Object.values(medicineUsage.usageByDay));
              const percentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;

              return (
                <div key={day} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{getDayOfWeek(day)}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">{usage}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Usage Pattern */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Usage Pattern</h3>
          <div className="space-y-3">
            {Object.entries(medicineUsage.usageByMonth).map(([month, usage]) => {
              const maxUsage = Math.max(...Object.values(medicineUsage.usageByMonth));
              const percentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;

              return (
                <div key={month} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{getMonthName(month)}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">{usage}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Peak usage month:</span>
              <span className="text-sm font-medium">{medicineUsage.peakUsageMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Low usage month:</span>
              <span className="text-sm font-medium">{medicineUsage.lowUsageMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">High season:</span>
              <span className="text-sm font-medium">{medicineUsage.seasonalPattern.highSeason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Low season:</span>
              <span className="text-sm font-medium">{medicineUsage.seasonalPattern.lowSeason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock depletion:</span>
              <span className="text-sm font-medium">
                {medicineUsage.projectedStockDepletion || 'No projection'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Reorder Level</div>
              <div className="text-sm text-blue-700">
                Maintain minimum stock of {medicineUsage.recommendedReorderLevel} units
              </div>
            </div>
            {medicineUsage.usageTrend.direction === 'up' && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Increasing Demand</div>
                <div className="text-sm text-green-700">
                  Usage is trending up by {medicineUsage.usageTrend.percentage}%. Consider increasing order quantities.
                </div>
              </div>
            )}
            {medicineUsage.usageTrend.direction === 'down' && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-900">Decreasing Demand</div>
                <div className="text-sm text-yellow-700">
                  Usage is trending down by {Math.abs(medicineUsage.usageTrend.percentage)}%. Review stock levels.
                </div>
              </div>
            )}
            {medicineUsage.projectedStockDepletion && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-900">Stock Alert</div>
                <div className="text-sm text-red-700">
                  Current stock will be depleted by {medicineUsage.projectedStockDepletion}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        {medicineUsage.recentTransactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No recent transactions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Date</TableCell>
                <TableCell header>Quantity</TableCell>
                <TableCell header>Reason</TableCell>
                <TableCell header>User</TableCell>
                <TableCell header>Batch</TableCell>
                <TableCell header>Remaining</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicineUsage.recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-red-600">-{transaction.quantity}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{transaction.reason}</div>
                      {transaction.patientReference && (
                        <div className="text-xs text-gray-500">
                          Patient: {transaction.patientReference}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{transaction.userName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{transaction.batchNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{transaction.remainingQuantity}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default MedicineUsageReport;