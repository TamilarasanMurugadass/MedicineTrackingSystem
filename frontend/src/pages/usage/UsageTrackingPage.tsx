import React, { useState } from 'react';
import { CalendarIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import UsageAnalytics from '../../components/analytics/UsageAnalytics';
import UsageChart from '../../components/analytics/UsageChart';
import UsagePatternsTable from '../../components/analytics/UsagePatternsTable';
import { useUsageAnalytics } from '../../hooks/useUsageAnalytics';

const UsageTrackingPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const {
    analytics,
    usageData,
    usagePatterns,
    isLoading,
    error,
    fetchAnalytics,
  } = useUsageAnalytics(dateRange);

  const filteredPatterns = usagePatterns.filter(pattern =>
    pattern.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportData = () => {
    // Create CSV content
    const headers = [
      'Medicine Name',
      'Total Usage',
      'Daily Average',
      'Current Stock',
      'Usage Frequency',
      'Trend',
      'Days to Empty',
      'Last Used'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredPatterns.map(pattern => [
        pattern.medicineName,
        pattern.totalUsage,
        pattern.averageDailyUsage.toFixed(2),
        pattern.currentStock,
        pattern.usageFrequency,
        pattern.usageTrend,
        pattern.projectedDaysToEmpty || 'N/A',
        new Date(pattern.lastUsedDate).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usage-patterns-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleMedicineClick = (medicineId: number) => {
    // Navigate to detailed medicine usage view (would implement routing)
    console.log(`View detailed usage for medicine ID: ${medicineId}`);
  };

  if (error) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={fetchAnalytics} className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Tracking & Analytics</h1>
          <p className="mt-2 text-gray-600">Monitor medicine usage patterns and consumption trends</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading || filteredPatterns.length === 0}
          >
            Export Data
          </Button>
          <Button
            leftIcon={<FunnelIcon className="h-4 w-4" />}
            variant="outline"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) =>
                setDateRange(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value),
                }))
              }
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) =>
                setDateRange(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value),
                }))
              }
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Medicine
            </label>
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Analytics Overview */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Usage Overview</h2>
        <UsageAnalytics {...analytics} />
      </div>

      {/* Usage Chart */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Usage Trends</h2>
        <UsageChart
          data={usageData}
          title={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Usage Patterns`}
          period={selectedPeriod}
        />
      </div>

      {/* Usage Patterns Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Medicine Usage Patterns</h2>
          <div className="text-sm text-gray-500">
            {filteredPatterns.length} of {usagePatterns.length} medicines
          </div>
        </div>
        <UsagePatternsTable
          patterns={filteredPatterns}
          isLoading={isLoading}
          onMedicineClick={handleMedicineClick}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medicines in use</span>
              <span className="font-medium">{usagePatterns.filter(p => p.totalUsage > 0).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High usage medicines</span>
              <span className="font-medium text-red-600">
                {usagePatterns.filter(p => p.usageFrequency === 'High').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low usage medicines</span>
              <span className="font-medium text-yellow-600">
                {usagePatterns.filter(p => p.usageFrequency === 'Low' && p.totalUsage > 0).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical stock (&lt; 7 days)</span>
              <span className="font-medium text-red-600">
                {usagePatterns.filter(p => p.projectedDaysToEmpty !== null && p.projectedDaysToEmpty < 7).length}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analytics.mostUsedMedicine && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">High Demand</div>
                <div className="text-sm text-blue-700">
                  {analytics.mostUsedMedicine.name} is frequently used. Consider increasing stock levels.
                </div>
              </div>
            )}
            {analytics.leastUsedMedicine && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-900">Low Utilization</div>
                <div className="text-sm text-yellow-700">
                  {analytics.leastUsedMedicine.name} has low usage. Review necessity of current stock levels.
                </div>
              </div>
            )}
            {analytics.expiringBatches > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-900">Expiry Alert</div>
                <div className="text-sm text-red-700">
                  {analytics.expiringBatches} batches are nearing expiry. Plan usage accordingly.
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsageTrackingPage;