import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { CreateMedicineBatchDto, UpdateMedicineBatchDto, MedicineBatchDto, MedicineDto } from '../../types';

// Combined form data type that includes all possible fields
type BatchFormData = {
  medicineId?: number;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  purchasePrice?: number;
  supplier?: string;
  initialQuantity?: number;
  isActive?: boolean;
};

interface BatchFormProps {
  batch?: MedicineBatchDto;
  medicines: MedicineDto[];
  onSubmit: (data: CreateMedicineBatchDto | UpdateMedicineBatchDto) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BatchForm: React.FC<BatchFormProps> = ({
  batch,
  medicines,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BatchFormData>({
    defaultValues: batch ? {
      medicineId: batch.medicineId,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate.split('T')[0],
      purchaseDate: batch.purchaseDate.split('T')[0],
      purchasePrice: batch.purchasePrice || 0,
      supplier: batch.supplier || '',
      initialQuantity: batch.initialQuantity,
      ...(batch && { isActive: batch.isActive }),
    } : {
      medicineId: 0,
      batchNumber: '',
      expiryDate: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      supplier: '',
      initialQuantity: 0,
    },
  });

  const medicineOptions = [
    { value: 0, label: 'Select medicine...' },
    ...medicines.map(medicine => ({
      value: medicine.id,
      label: `${medicine.name} - ${medicine.manufacturer}`,
    })),
  ];

  const handleFormSubmit = async (data: BatchFormData) => {
    let submitData: CreateMedicineBatchDto | UpdateMedicineBatchDto;

    if (batch) {
      // Updating existing batch
      submitData = {
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        purchaseDate: data.purchaseDate,
        purchasePrice: data.purchasePrice,
        supplier: data.supplier,
        isActive: data.isActive ?? true,
      } as UpdateMedicineBatchDto;
    } else {
      // Creating new batch
      submitData = {
        medicineId: data.medicineId!,
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        purchaseDate: data.purchaseDate,
        purchasePrice: data.purchasePrice,
        supplier: data.supplier,
        initialQuantity: data.initialQuantity!,
      } as CreateMedicineBatchDto;
    }

    const success = await onSubmit(submitData);
    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!batch && (
          <div className="md:col-span-2">
            <Select
              label="Medicine *"
              {...register('medicineId', {
                required: 'Medicine is required',
                validate: (value) => value !== 0 || 'Please select a medicine',
              })}
              error={errors.medicineId?.message}
              options={medicineOptions}
            />
          </div>
        )}

        <Input
          label="Batch Number *"
          {...register('batchNumber', { required: 'Batch number is required' })}
          error={errors.batchNumber?.message}
          placeholder="Enter batch number"
        />

        {!batch && (
          <Input
            label="Initial Quantity *"
            type="number"
            {...register('initialQuantity', {
              required: 'Initial quantity is required',
              min: { value: 1, message: 'Must be at least 1' },
            })}
            error={errors.initialQuantity?.message}
            placeholder="Enter initial quantity"
          />
        )}

        <Input
          label="Expiry Date *"
          type="date"
          {...register('expiryDate', { required: 'Expiry date is required' })}
          error={errors.expiryDate?.message}
        />

        <Input
          label="Purchase Date *"
          type="date"
          {...register('purchaseDate', { required: 'Purchase date is required' })}
          error={errors.purchaseDate?.message}
        />

        <Input
          label="Purchase Price"
          type="number"
          step="0.01"
          {...register('purchasePrice', {
            min: { value: 0, message: 'Must be 0 or greater' },
          })}
          error={errors.purchasePrice?.message}
          placeholder="Enter purchase price"
        />

        <Input
          label="Supplier"
          {...register('supplier')}
          error={errors.supplier?.message}
          placeholder="Enter supplier name"
        />
      </div>

      {batch && (
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {batch ? 'Update Batch' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;