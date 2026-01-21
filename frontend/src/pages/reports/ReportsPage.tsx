import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import MedicineUsageReport from '../../components/reports/MedicineUsageReport';
import { useMedicines } from '../../hooks/useMedicines';
import { useInventoryTransactions } from '../../hooks/useInventoryTransactions';
import { useMedicineBatches } from '../../hooks/useMedicineBatches';

interface ReportFilter {
  startDate: Date;
  endDate: Date;
  medicineId?: number;
  reportType: 'usage' | 'inventory' | 'transactions' | 'expiry';
}

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  type: 'usage' | 'inventory' | 'transactions' | 'expiry';
  features: string[];
}

const reportOptions: ReportOption[] = [
  {
    id: 'usage-analysis',
    title: 'Usage Analysis Report',
    description: 'Detailed analysis of medicine usage patterns and trends',
    icon: ChartBarIcon,
    type: 'usage',
    features: [
      'Daily and monthly usage patterns',
      'Peak usage identification',
      'Seasonal trend analysis',
      'Reorder recommendations',
      'Usage projections'
    ]
  },
  {
    id: 'inventory-status',
    title: 'Inventory Status Report',
    description: 'Current stock levels and batch information',
    icon: TableCellsIcon,
    type: 'inventory',
    features: [
      'Current stock levels',
      'Batch expiry tracking',
      'Low stock alerts',
      'Inventory valuation',
      'Batch utilization rates'
    ]
  },
  {
    id: 'transaction-summary',
    title: 'Transaction Summary',
    description: 'Complete transaction history and audit trail',
    icon: DocumentArrowDownIcon,
    type: 'transactions',
    features: [
      'All stock movements',
      'User activity tracking',
      'Reason-based categorization',
      'Time-based analysis',
      'Audit compliance data'
    ]
  },
  {
    id: 'expiry-forecast',
    title: 'Expiry Forecast',
    description: 'Upcoming expirations and waste prevention',
    icon: CalendarIcon,
    type: 'expiry',
    features: [
      'Expiring batch alerts',
      'Waste reduction insights',
      'FEFO compliance tracking',
      'Financial impact analysis',
      'Action recommendations'
    ]
  }
];

const ReportsPage: React.FC = () => {
  const { medicines } = useMedicines();
  const { transactions } = useInventoryTransactions();
  const { batches } = useMedicineBatches();

  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    reportType: 'usage',
  });

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateReport = (reportOption: ReportOption) => {
    setSelectedReport(reportOption);
    setFilters(prev => ({ ...prev, reportType: reportOption.type }));
    setIsReportModalOpen(true);
  };

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    if (!selectedReport) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${selectedReport.id}-${timestamp}.${format}`;

    if (format === 'csv') {
      // Generate CSV based on report type
      let csvContent = '';

      switch (selectedReport.type) {
        case 'usage':
          const headers = ['Medicine', 'Total Usage', 'Daily Average', 'Current Stock', 'Last Used'];
          csvContent = [
            headers.join(','),
            ...medicines.map(medicine => {
              const medicineBatches = batches.filter(b => b.medicineId === medicine.id);
              const medicineBatchIds = medicineBatches.map(b => b.id);
              const medicineTransactions = transactions.filter(t => medicineBatchIds.includes(t.medicineBatchId) && t.isStockReduction);
              const totalUsage = medicineTransactions.reduce((sum, t) => sum + t.quantity, 0);
              const averageDaily = totalUsage / 30;
              const currentStock = medicineBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
              const lastTransaction = medicineTransactions.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              const lastUsed = lastTransaction ? new Date(lastTransaction.createdAt).toLocaleDateString() : 'Never';

              return [
                medicine.name,
                totalUsage,
                averageDaily.toFixed(2),
                currentStock,
                lastUsed
              ].join(',');
            })
          ].join('\n');
          break;

        case 'inventory':
          csvContent = [
            ['Medicine', 'Batch', 'Current Stock', 'Initial Stock', 'Usage %', 'Expiry Date', 'Status'].join(','),
            ...batches.map(batch => [
              batch.medicineName,
              batch.batchNumber,
              batch.currentQuantity,
              batch.initialQuantity,
              batch.usagePercentage.toFixed(1),
              new Date(batch.expiryDate).toLocaleDateString(),
              batch.isExpired ? 'Expired' : batch.isNearingExpiry ? 'Expiring Soon' : 'Good'
            ].join(','))
          ].join('\n');
          break;

        case 'transactions':
          csvContent = [
            ['Date', 'Medicine', 'Batch', 'Type', 'Quantity', 'Reason', 'User', 'Remaining'].join(','),
            ...transactions.map(transaction => [
              new Date(transaction.createdAt).toLocaleDateString(),
              transaction.medicineName,
              transaction.batchNumber,
              transaction.transactionTypeDisplay,
              transaction.quantity,
              transaction.reason || '',
              transaction.creatorName,
              transaction.remainingQuantity
            ].join(','))
          ].join('\n');
          break;

        case 'expiry':
          const expiringBatches = batches.filter(b => b.isNearingExpiry || b.isExpired);
          csvContent = [
            ['Medicine', 'Batch', 'Stock', 'Expiry Date', 'Days to Expiry', 'Status'].join(','),
            ...expiringBatches.map(batch => [
              batch.medicineName,
              batch.batchNumber,
              batch.currentQuantity,
              new Date(batch.expiryDate).toLocaleDateString(),
              batch.daysToExpiry,
              batch.isExpired ? 'Expired' : 'Expiring Soon'
            ].join(','))
          ].join('\n');
          break;
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const getMockUsageDetails = (medicineId: number) => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return null;

    const medicineBatches = batches.filter(b => b.medicineId === medicineId);
    const medicineBatchIds = medicineBatches.map(b => b.id);
    const medicineTransactions = transactions.filter(t => medicineBatchIds.includes(t.medicineBatchId) && t.isStockReduction);

    return {
      medicineId,
      medicineName: medicine.name,
      totalUsage: medicineTransactions.reduce((sum, t) => sum + t.quantity, 0),
      averageDailyUsage: medicineTransactions.reduce((sum, t) => sum + t.quantity, 0) / 30,
      peakUsageMonth: 'March',
      lowUsageMonth: 'December',
      usageByDay: {
        '0': 45, '1': 52, '2': 48, '3': 55, '4': 50, '5': 35, '6': 30
      },
      usageByMonth: {
        '1': 120, '2': 135, '3': 180, '4': 165, '5': 140, '6': 155,
        '7': 170, '8': 160, '9': 145, '10': 130, '11': 115, '12': 95
      },
      currentStock: medicineBatches.reduce((sum, b) => sum + b.currentQuantity, 0),
      totalBatches: medicineBatches.length,
      activeBatches: medicineBatches.filter(b => !b.isDepleted).length,
      recentTransactions: medicineTransactions.slice(0, 10).map(t => ({
        id: t.id,
        date: t.createdAt,
        quantity: t.quantity,
        reason: t.reason || 'Usage',
        patientReference: t.patientReference,
        userName: t.creatorName,
        batchNumber: t.batchNumber,
        remainingQuantity: t.remainingQuantity
      })),
      usageTrend: {
        direction: 'up' as const,
        percentage: 12.5
      },
      seasonalPattern: {
        highSeason: 'Winter',
        lowSeason: 'Summer'
      },
      recommendedReorderLevel: 100,
      projectedStockDepletion: '2024-02-15'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Generate comprehensive reports and export data</p>
        </div>
      </div>

      {/* Report Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportOptions.map((option) => (
          <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <option.icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{option.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                <ul className="mt-3 space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-400">• {feature}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleGenerateReport(option)}
                    leftIcon={<ChartBarIcon className="h-4 w-4" />}
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Export Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Export</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
              onClick={() => handleExportReport('csv')}
              disabled={!selectedReport}
            >
              Export CSV
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate.toISOString().split('T')[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                startDate: new Date(e.target.value)
              }))}
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate.toISOString().split('T')[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                endDate: new Date(e.target.value)
              }))}
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                reportType: e.target.value as any
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="usage">Usage Analysis</option>
              <option value="inventory">Inventory Status</option>
              <option value="transactions">Transaction Summary</option>
              <option value="expiry">Expiry Forecast</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        title={selectedReport?.title || 'Report'}
        size="xl"
      >
        <div className="space-y-6">
          {selectedReport?.type === 'usage' && (
            <div>
              <div className="mb-4">
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-4">
                {filteredMedicines.slice(0, 5).map((medicine) => {
                  const usageDetails = getMockUsageDetails(medicine.id);
                  return usageDetails ? (
                    <MedicineUsageReport
                      key={medicine.id}
                      medicineUsage={usageDetails}
                      dateRange={filters}
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}

          {selectedReport?.type !== 'usage' && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                {selectedReport?.title} report view will be implemented here
              </div>
              <Button
                className="mt-4"
                onClick={() => handleExportReport('csv')}
              >
                Export Data as CSV
              </Button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsReportModalOpen(false);
                setSelectedReport(null);
              }}
            >
              Close
            </Button>
            <Button
              leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
              onClick={() => handleExportReport('csv')}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;