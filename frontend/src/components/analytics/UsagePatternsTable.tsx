import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/Table';
import Card from '../ui/Card';

interface MedicineUsagePattern {
  medicineId: number;
  medicineName: string;
  totalUsage: number;
  averageDailyUsage: number;
  peakUsageDay: string;
  lastUsedDate: string;
  currentStock: number;
  usageFrequency: 'High' | 'Medium' | 'Low';
  projectedDaysToEmpty: number | null;
  usageTrend: 'Increasing' | 'Decreasing' | 'Stable';
}

interface UsagePatternsTableProps {
  patterns: MedicineUsagePattern[];
  isLoading?: boolean;
  onMedicineClick?: (medicineId: number) => void;
}

const UsagePatternsTable: React.FC<UsagePatternsTableProps> = ({
  patterns,
  isLoading = false,
  onMedicineClick,
}) => {
  const getFrequencyBadge = (frequency: 'High' | 'Medium' | 'Low') => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[frequency]}`}>
        {frequency}
      </span>
    );
  };

  const getTrendBadge = (trend: 'Increasing' | 'Decreasing' | 'Stable') => {
    const styles = {
      Increasing: 'bg-blue-100 text-blue-800',
      Decreasing: 'bg-gray-100 text-gray-800',
      Stable: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[trend]}`}>
        {trend}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const handleRowClick = (medicineId: number) => {
    if (onMedicineClick) {
      onMedicineClick(medicineId);
    }
  };

  if (isLoading) {
    return (
      <Card padding="none">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No usage patterns available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Medicine</TableCell>
            <TableCell header>Total Usage</TableCell>
            <TableCell header>Daily Average</TableCell>
            <TableCell header>Current Stock</TableCell>
            <TableCell header>Usage Frequency</TableCell>
            <TableCell header>Trend</TableCell>
            <TableCell header>Days to Empty</TableCell>
            <TableCell header>Last Used</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patterns.map((pattern) => (
            <TableRow
              key={pattern.medicineId}
              onClick={() => handleRowClick(pattern.medicineId)}
              className={onMedicineClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{pattern.medicineName}</div>
                  <div className="text-sm text-gray-500">
                    Peak: {pattern.peakUsageDay}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{pattern.totalUsage} units</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{pattern.averageDailyUsage.toFixed(1)} units/day</div>
              </TableCell>
              <TableCell>
                <div className={`font-medium ${
                  pattern.currentStock < 50 ? 'text-red-600' :
                  pattern.currentStock < 100 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {pattern.currentStock} units
                </div>
              </TableCell>
              <TableCell>
                {getFrequencyBadge(pattern.usageFrequency)}
              </TableCell>
              <TableCell>
                {getTrendBadge(pattern.usageTrend)}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {pattern.projectedDaysToEmpty !== null ? (
                    <span className={
                      pattern.projectedDaysToEmpty < 7 ? 'text-red-600' :
                      pattern.projectedDaysToEmpty < 30 ? 'text-yellow-600' : 'text-green-600'
                    }>
                      {pattern.projectedDaysToEmpty} days
                    </span>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {formatDate(pattern.lastUsedDate)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default UsagePatternsTable;