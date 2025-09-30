import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { CreateMedicineDto, UpdateMedicineDto, MedicineDto } from '../../types';

// Combined form data type that includes all possible fields
type MedicineFormData = {
  name: string;
  genericName?: string;
  manufacturer: string;
  description?: string;
  strength?: string;
  unitOfMeasure: string;
  minimumStockLevel: number;
  isActive?: boolean;
};

interface MedicineFormProps {
  medicine?: MedicineDto;
  onSubmit: (data: CreateMedicineDto | UpdateMedicineDto) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MedicineForm: React.FC<MedicineFormProps> = ({
  medicine,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicineFormData>({
    defaultValues: medicine ? {
      name: medicine.name,
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer,
      description: medicine.description || '',
      strength: medicine.strength || '',
      unitOfMeasure: medicine.unitOfMeasure,
      minimumStockLevel: medicine.minimumStockLevel,
      ...(medicine && { isActive: medicine.isActive }),
    } : {
      name: '',
      genericName: '',
      manufacturer: '',
      description: '',
      strength: '',
      unitOfMeasure: '',
      minimumStockLevel: 10,
    },
  });

  const unitOptions = [
    { value: '', label: 'Select unit...' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'capsules', label: 'Capsules' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'units', label: 'Units' },
    { value: 'vials', label: 'Vials' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'boxes', label: 'Boxes' },
  ];

  const handleFormSubmit = async (data: MedicineFormData) => {
    let submitData: CreateMedicineDto | UpdateMedicineDto;

    if (medicine) {
      // Update scenario - include isActive
      submitData = {
        name: data.name,
        genericName: data.genericName,
        manufacturer: data.manufacturer,
        description: data.description,
        strength: data.strength,
        unitOfMeasure: data.unitOfMeasure,
        minimumStockLevel: data.minimumStockLevel,
        isActive: data.isActive ?? true,
      } as UpdateMedicineDto;
    } else {
      // Create scenario - exclude isActive
      submitData = {
        name: data.name,
        genericName: data.genericName,
        manufacturer: data.manufacturer,
        description: data.description,
        strength: data.strength,
        unitOfMeasure: data.unitOfMeasure,
        minimumStockLevel: data.minimumStockLevel,
      } as CreateMedicineDto;
    }

    const success = await onSubmit(submitData);
    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Medicine Name *"
          {...register('name', { required: 'Medicine name is required' })}
          error={errors.name?.message}
          placeholder="Enter medicine name"
        />

        <Input
          label="Generic Name"
          {...register('genericName')}
          error={errors.genericName?.message}
          placeholder="Enter generic name"
        />

        <Input
          label="Manufacturer *"
          {...register('manufacturer', { required: 'Manufacturer is required' })}
          error={errors.manufacturer?.message}
          placeholder="Enter manufacturer name"
        />

        <Input
          label="Strength"
          {...register('strength')}
          error={errors.strength?.message}
          placeholder="e.g., 500mg, 10ml"
        />

        <Select
          label="Unit of Measure *"
          {...register('unitOfMeasure', { required: 'Unit of measure is required' })}
          error={errors.unitOfMeasure?.message}
          options={unitOptions}
        />

        <Input
          label="Minimum Stock Level *"
          type="number"
          {...register('minimumStockLevel', {
            required: 'Minimum stock level is required',
            min: { value: 0, message: 'Must be 0 or greater' },
          })}
          error={errors.minimumStockLevel?.message}
          placeholder="Enter minimum stock level"
        />
      </div>

      <div className="md:col-span-2">
        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter medicine description"
        />
      </div>

      {medicine && (
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
          {medicine ? 'Update Medicine' : 'Create Medicine'}
        </Button>
      </div>
    </form>
  );
};

export default MedicineForm;