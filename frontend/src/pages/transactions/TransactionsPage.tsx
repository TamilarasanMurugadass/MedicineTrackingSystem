import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowDownIcon, ArrowUpIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { useInventoryTransactions } from '../../hooks/useInventoryTransactions';
import { TransactionType } from '../../types';

const TransactionsPage: React.FC = () => {
  const { transactions, isLoading, error, fetchTransactions } = useInventoryTransactions();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction =>
    transaction.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.reason && transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTransactionIcon = (transactionType: TransactionType) => {
    switch (transactionType) {
      case TransactionType.IN:
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case TransactionType.OUT:
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      case TransactionType.ADJUSTMENT:
        return <AdjustmentsHorizontalIcon className="h-4 w-4 text-blue-600" />;
      case TransactionType.EXPIRED:
        return <ArrowDownIcon className="h-4 w-4 text-yellow-600" />;
      case TransactionType.DAMAGED:
        return <ArrowDownIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (transaction: any) => {
    if (transaction.isStockAddition) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Stock Added
        </span>
      );
    }
    if (transaction.isStockReduction) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Stock Reduced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Adjustment
      </span>
    );
  };

  if (error) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={() => fetchTransactions()} className="mt-2">
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
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-2 text-gray-600">View all inventory transactions and usage records</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by medicine name, batch, user, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowUpIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Stock Additions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {transactions.filter(t => t.isStockAddition).length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowDownIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Stock Reductions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {transactions.filter(t => t.isStockReduction).length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AdjustmentsHorizontalIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Adjustments
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {transactions.filter(t => t.transactionType === TransactionType.ADJUSTMENT).length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowDownIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Expired/Damaged
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {transactions.filter(t =>
                    t.transactionType === TransactionType.EXPIRED ||
                    t.transactionType === TransactionType.DAMAGED
                  ).length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No transactions found</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Type</TableCell>
                <TableCell header>Medicine</TableCell>
                <TableCell header>Batch</TableCell>
                <TableCell header>Quantity</TableCell>
                <TableCell header>Remaining</TableCell>
                <TableCell header>Reason</TableCell>
                <TableCell header>User</TableCell>
                <TableCell header>Date</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTransactionIcon(transaction.transactionType)}
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.transactionTypeDisplay}
                        </div>
                        {getTransactionBadge(transaction)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {transaction.medicineName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.batchNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${
                      transaction.isStockAddition ? 'text-green-600' :
                      transaction.isStockReduction ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.isStockAddition ? '+' : transaction.isStockReduction ? '-' : '±'}
                      {transaction.quantity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.remainingQuantity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.reason || '-'}
                      </div>
                      {transaction.patientReference && (
                        <div className="text-xs text-gray-500">
                          Patient: {transaction.patientReference}
                        </div>
                      )}
                      {transaction.notes && (
                        <div className="text-xs text-gray-500">
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.creatorName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </div>
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

export default TransactionsPage;