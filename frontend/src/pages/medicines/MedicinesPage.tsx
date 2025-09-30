import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import MedicineForm from '../../components/medicine/MedicineForm';
import { useMedicines } from '../../hooks/useMedicines';
import { MedicineDto, CreateMedicineDto, UpdateMedicineDto } from '../../types';

const MedicinesPage: React.FC = () => {
  const {
    medicines,
    isLoading,
    error,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    fetchMedicines,
  } = useMedicines();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchMedicines(searchTerm);
    } else {
      await fetchMedicines();
    }
  };

  const handleCreate = async (data: CreateMedicineDto | UpdateMedicineDto) => {
    return await createMedicine(data as CreateMedicineDto);
  };

  const handleEdit = (medicine: MedicineDto) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: CreateMedicineDto | UpdateMedicineDto) => {
    if (selectedMedicine) {
      return await updateMedicine(selectedMedicine.id, data as UpdateMedicineDto);
    }
    return false;
  };

  const handleDelete = (medicine: MedicineDto) => {
    setSelectedMedicine(medicine);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedMedicine) {
      const success = await deleteMedicine(selectedMedicine.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setSelectedMedicine(null);
      }
    }
  };

  const getStockStatusBadge = (medicine: MedicineDto) => {
    if (medicine.isLowStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
        In Stock
      </span>
    );
  };

  if (error) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="text-red-500 text-sm">{error}</div>
          <Button onClick={fetchMedicines} className="mt-2">
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
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="mt-2 text-gray-600">Manage your medicine catalog and inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search medicines by name, generic name, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                fetchMedicines();
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      {/* Medicines Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No medicines found</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Name</TableCell>
                <TableCell header>Generic Name</TableCell>
                <TableCell header>Manufacturer</TableCell>
                <TableCell header>Strength</TableCell>
                <TableCell header>Current Stock</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.unitOfMeasure}</div>
                    </div>
                  </TableCell>
                  <TableCell>{medicine.genericName || '-'}</TableCell>
                  <TableCell>{medicine.manufacturer}</TableCell>
                  <TableCell>{medicine.strength || '-'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{medicine.totalCurrentStock}</div>
                      <div className="text-sm text-gray-500">
                        Min: {medicine.minimumStockLevel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStockStatusBadge(medicine)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(medicine)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Create Medicine Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Medicine"
        size="lg"
      >
        <MedicineForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMedicine(null);
        }}
        title="Edit Medicine"
        size="lg"
      >
        {selectedMedicine && (
          <MedicineForm
            medicine={selectedMedicine}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedMedicine(null);
            }}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMedicine(null);
        }}
        title="Delete Medicine"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete "{selectedMedicine?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedMedicine(null);
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

export default MedicinesPage;