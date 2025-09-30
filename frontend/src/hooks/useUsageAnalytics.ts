import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

interface Transaction {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  isStockReduction: boolean;
  isStockAddition: boolean;
  transactionType: string;
  createdAt: string;
}

interface Batch {
  id: number;
  medicineId: number;
  currentQuantity: number;
  isNearingExpiry: boolean;
  isExpired: boolean;
  isDepleted: boolean;
  usagePercentage: number;
}

interface Medicine {
  id: number;
  name: string;
}

interface UsageDataPoint {
  date: string;
  usage: number;
  additions: number;
  reductions: number;
}

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

interface UsageAnalytics {
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

export const useUsageAnalytics = (dateRange?: { startDate: Date; endDate: Date }) => {
  const { get } = useApi();
  const [analytics, setAnalytics] = useState<UsageAnalytics>({
    totalMedicines: 0,
    totalTransactions: 0,
    mostUsedMedicine: null,
    leastUsedMedicine: null,
    expiringBatches: 0,
    lowStockBatches: 0,
    averageUsagePerDay: 0,
    usageTrend: 'stable',
  });
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);
  const [usagePatterns, setUsagePatterns] = useState<MedicineUsagePattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll simulate the analytics data based on existing transactions
      // In a real implementation, these would be separate API endpoints

      // Fetch transactions and batches to calculate analytics
      const [transactionsResponse, batchesResponse, medicinesResponse] = await Promise.all([
        get<{ success: boolean; data: Transaction[]; message: string }>('/inventory/transactions'),
        get<{ success: boolean; data: Batch[]; message: string }>('/medicinebatches'),
        get<{ success: boolean; data: Medicine[]; message: string }>('/medicines'),
      ]);

      // Extract data from wrapped responses
      const transactions = transactionsResponse?.success ? transactionsResponse.data : [];
      const batches = batchesResponse?.success ? batchesResponse.data : [];
      const medicines = medicinesResponse?.success ? medicinesResponse.data : [];

      // Calculate analytics
      const totalMedicines = medicines.length;
      const totalTransactions = transactions.length;

      // Calculate medicine usage counts
      const medicineUsage = transactions.reduce((acc: Record<string, number>, transaction: any) => {
        if (transaction.isStockReduction) {
          acc[transaction.medicineName] = (acc[transaction.medicineName] || 0) + transaction.quantity;
        }
        return acc;
      }, {});

      const sortedUsage = Object.entries(medicineUsage).sort(([,a], [,b]) => (b as number) - (a as number));
      const mostUsedMedicine = sortedUsage.length > 0 ? { name: sortedUsage[0][0], usage: sortedUsage[0][1] as number } : null;
      const leastUsedMedicine = sortedUsage.length > 0 ? { name: sortedUsage[sortedUsage.length - 1][0], usage: sortedUsage[sortedUsage.length - 1][1] as number } : null;

      // Calculate batch alerts
      const expiringBatches = batches.filter((batch: any) => batch.isNearingExpiry && !batch.isExpired).length;
      const lowStockBatches = batches.filter((batch: any) => batch.usagePercentage > 80 && !batch.isDepleted).length;

      // Calculate average usage per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions.filter((transaction: any) =>
        transaction.isStockReduction && new Date(transaction.createdAt) >= thirtyDaysAgo
      );
      const totalRecentUsage = recentTransactions.reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);
      const averageUsagePerDay = totalRecentUsage / 30;

      // Simple trend calculation (comparing last 15 days to previous 15 days)
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const lastFifteenDays = recentTransactions.filter((transaction: any) =>
        new Date(transaction.createdAt) >= fifteenDaysAgo
      );
      const previousFifteenDays = recentTransactions.filter((transaction: any) => {
        const date = new Date(transaction.createdAt);
        return date < fifteenDaysAgo && date >= thirtyDaysAgo;
      });

      const recentUsage = lastFifteenDays.reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);
      const previousUsage = previousFifteenDays.reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);

      let usageTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentUsage > previousUsage * 1.1) usageTrend = 'up';
      else if (recentUsage < previousUsage * 0.9) usageTrend = 'down';

      setAnalytics({
        totalMedicines,
        totalTransactions,
        mostUsedMedicine,
        leastUsedMedicine,
        expiringBatches,
        lowStockBatches,
        averageUsagePerDay,
        usageTrend,
      });

      // Generate usage data for chart (last 7 days)
      const chartData: UsageDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayTransactions = transactions.filter((transaction: any) =>
          transaction.createdAt.startsWith(dateStr)
        );

        const usage = dayTransactions
          .filter((transaction: any) => transaction.isStockReduction)
          .reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);

        const additions = dayTransactions
          .filter((transaction: any) => transaction.isStockAddition)
          .reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);

        const reductions = dayTransactions
          .filter((transaction: any) => transaction.isStockReduction ||
            transaction.transactionType === 'EXPIRED' ||
            transaction.transactionType === 'DAMAGED')
          .reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);

        chartData.push({
          date: dateStr,
          usage,
          additions,
          reductions,
        });
      }

      setUsageData(chartData);

      // Generate usage patterns for medicines
      const patterns: MedicineUsagePattern[] = medicines.map((medicine: any) => {
        const medicineTransactions = transactions.filter((transaction: any) =>
          transaction.medicineId === medicine.id && transaction.isStockReduction
        );

        const totalUsage = medicineTransactions.reduce((sum: number, transaction: any) => sum + transaction.quantity, 0);
        const averageDailyUsage = totalUsage / 30; // Over last 30 days

        const lastTransaction = medicineTransactions
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        // Get current stock from batches
        const medicineBatches = batches.filter((batch: any) => batch.medicineId === medicine.id);
        const currentStock = medicineBatches.reduce((sum: number, batch: any) => sum + batch.currentQuantity, 0);

        // Determine usage frequency
        let usageFrequency: 'High' | 'Medium' | 'Low' = 'Low';
        if (averageDailyUsage > 10) usageFrequency = 'High';
        else if (averageDailyUsage > 5) usageFrequency = 'Medium';

        // Calculate projected days to empty
        const projectedDaysToEmpty = averageDailyUsage > 0 ? Math.ceil(currentStock / averageDailyUsage) : null;

        return {
          medicineId: medicine.id,
          medicineName: medicine.name,
          totalUsage,
          averageDailyUsage,
          peakUsageDay: 'Monday', // Simplified - would need more complex calculation
          lastUsedDate: lastTransaction ? lastTransaction.createdAt : new Date().toISOString(),
          currentStock,
          usageFrequency,
          projectedDaysToEmpty,
          usageTrend: 'Stable' as const, // Simplified - would need trend analysis
        };
      });

      setUsagePatterns(patterns);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch usage analytics');
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, fetchAnalytics]);

  return {
    analytics,
    usageData,
    usagePatterns,
    isLoading,
    error,
    fetchAnalytics,
  };
};