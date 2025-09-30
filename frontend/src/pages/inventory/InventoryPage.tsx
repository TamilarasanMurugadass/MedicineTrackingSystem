import React, { useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import BatchForm from '../../components/inventory/BatchForm';
import WithdrawForm from '../../components/inventory/WithdrawForm';
import AdjustStockForm from '../../components/inventory/AdjustStockForm';
import { useMedicineBatches } from '../../hooks/useMedicineBatches';
import { useInventoryTransactions } from '../../hooks/useInventoryTransactions';
import { useMedicines } from '../../hooks/useMedicines';
import {
  MedicineBatchDto,
  CreateMedicineBatchDto,
  UpdateMedicineBatchDto,
  WithdrawMedicineRequest,
  AdjustStockRequest,
  MarkExpiredRequest,
  MarkDamagedRequest,
} from '../../types';

const InventoryPage: React.FC = () => {
  const { medicines } = useMedicines();
  const {
    batches,
    isLoading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
  } = useMedicineBatches();
  const {
    withdrawMedicine,
    adjustStock,
    markExpired,
    markDamaged,
    isLoading: transactionLoading,
  } = useInventoryTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatchDto | null>(null);

  const filteredBatches = batches.filter(batch =>
    batch.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: CreateMedicineBatchDto | UpdateMedicineBatchDto) => {
    return await createBatch(data as CreateMedicineBatchDto);
  };

  const handleEdit = (batch: MedicineBatchDto) => {
    setSelectedBatch(batch);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: CreateMedicineBatchDto | UpdateMedicineBatchDto) => {
    if (selectedBatch) {
      return await updateBatch(selectedBatch.id, data as UpdateMedicineBatchDto);
    }
    return false;
  };

  const handleWithdraw = (batch: MedicineBatchDto) => {
    setSelectedBatch(batch);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = async (data: WithdrawMedicineRequest) => {
    const success = await withdrawMedicine(data);
    if (success) {
      await fetchBatches();
    }
    return success;
  };

  const handleAdjust = (batch: MedicineBatchDto) => {
    setSelectedBatch(batch);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (data: AdjustStockRequest) => {
    const success = await adjustStock(data);
    if (success) {
      await fetchBatches();
    }
    return success;
  };

  const handleMarkExpired = async (batch: MedicineBatchDto) => {
    const data: MarkExpiredRequest = {
      batchId: batch.id,
      notes: `Marked as expired: ${batch.batchNumber}`,
    };
    const success = await markExpired(data);
    if (success) {
      await fetchBatches();
    }
  };

  const handleMarkDamaged = async (batch: MedicineBatchDto, quantity: number, reason: string) => {
    const data: MarkDamagedRequest = {
      batchId: batch.id,
      quantity,
      reason,
      notes: `Marked as damaged: ${batch.batchNumber}`,
    };
    const success = await markDamaged(data);
    if (success) {
      await fetchBatches();
    }
  };

  const handleDelete = (batch: MedicineBatchDto) => {
    setSelectedBatch(batch);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedBatch) {
      const success = await deleteBatch(selectedBatch.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setSelectedBatch(null);
      }
    }
  };

  const getExpiryStatusBadge = (batch: MedicineBatchDto) => {
    if (batch.isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    if (batch.isNearingExpiry) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Good
      </span>
    );
  };

  const getStockStatusBadge = (batch: MedicineBatchDto) => {
    if (batch.isDepleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Depleted
        </span>
      );
    }
    if (batch.usagePercentage > 80) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Available
      </span>
    );
  };

  if (error) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={() => fetchBatches()} className="mt-2">
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">Manage medicine batches and stock levels</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Batch
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by medicine name or batch number..."
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

      {/* Inventory Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No batches found</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Medicine</TableCell>
                <TableCell header>Batch Number</TableCell>
                <TableCell header>Stock</TableCell>
                <TableCell header>Expiry Date</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{batch.medicineName}</div>
                      <div className="text-sm text-gray-500">
                        Created by {batch.creatorName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{batch.batchNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{batch.currentQuantity} / {batch.initialQuantity}</div>
                      <div className="text-sm text-gray-500">
                        {batch.usagePercentage.toFixed(1)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {batch.daysToExpiry > 0 ? `${batch.daysToExpiry} days left` : 'Expired'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getExpiryStatusBadge(batch)}
                      {getStockStatusBadge(batch)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleWithdraw(batch)}
                        disabled={batch.isDepleted}
                        className="p-1 text-orange-600 hover:text-orange-800 disabled:text-gray-400"
                        title="Withdraw"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAdjust(batch)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Adjust Stock"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(batch)}
                        className="p-1 text-primary-600 hover:text-primary-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {!batch.isExpired && (
                        <button
                          onClick={() => handleMarkExpired(batch)}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title="Mark as Expired"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(batch)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Batch Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Batch"
        size="lg"
      >
        <BatchForm
          medicines={medicines}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Edit Batch"
        size="lg"
      >
        {selectedBatch && (
          <BatchForm
            batch={selectedBatch}
            medicines={medicines}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedBatch(null);
            }}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Withdraw Medicine Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Withdraw Medicine"
        size="md"
      >
        {selectedBatch && (
          <WithdrawForm
            batch={selectedBatch}
            onSubmit={handleWithdrawSubmit}
            onCancel={() => {
              setIsWithdrawModalOpen(false);
              setSelectedBatch(null);
            }}
            isLoading={transactionLoading}
          />
        )}
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Adjust Stock"
        size="md"
      >
        {selectedBatch && (
          <AdjustStockForm
            batch={selectedBatch}
            onSubmit={handleAdjustSubmit}
            onCancel={() => {
              setIsAdjustModalOpen(false);
              setSelectedBatch(null);
            }}
            isLoading={transactionLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBatch(null);
        }}
        title="Delete Batch"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete batch "{selectedBatch?.batchNumber}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedBatch(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryPage;