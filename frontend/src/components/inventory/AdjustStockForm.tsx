import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AdjustStockRequest, MedicineBatchDto } from '../../types';

interface AdjustStockFormProps {
  batch: MedicineBatchDto;
  onSubmit: (data: AdjustStockRequest) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AdjustStockForm: React.FC<AdjustStockFormProps> = ({
  batch,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdjustStockRequest>({
    defaultValues: {
      batchId: batch.id,
      adjustment: 0,
      reason: '',
      notes: '',
    },
  });

  const adjustment = watch('adjustment');
  const newQuantity = batch.currentQuantity + (Number(adjustment) || 0);
  const handleFormSubmit = async (data: AdjustStockRequest) => {
    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Batch Information</h4>
        <div className="mt-2 text-sm text-gray-600">
          <p><span className="font-medium">Medicine:</span> {batch.medicineName}</p>
          <p><span className="font-medium">Batch:</span> {batch.batchNumber}</p>
          <p><span className="font-medium">Current Stock:</span> {batch.currentQuantity} units</p>
          {adjustment !== 0 && (
            <p className={`font-medium ${newQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              New Stock: {newQuantity} units
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Adjustment Amount *"
          type="number"
          {...register('adjustment', {
            required: 'Adjustment amount is required',
            validate: (value) => {
              if (value === 0) return 'Adjustment cannot be zero';
              if (batch.currentQuantity + value < 0) {
                return `Adjustment would result in negative stock (${batch.currentQuantity + value})`;
              }
              return true;
            },
          })}
          error={errors.adjustment?.message}
          placeholder="Enter adjustment (+/- amount)"
          helperText="Use positive numbers to add stock, negative to reduce"
        />

        <Input
          label="Reason *"
          {...register('reason', { required: 'Reason is required' })}
          error={errors.reason?.message}
          placeholder="e.g., Stock count correction, Damaged goods removal"
        />

        <Input
          label="Notes"
          {...register('notes')}
          error={errors.notes?.message}
          placeholder="Additional details about the adjustment"
        />

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
            variant={adjustment && adjustment > 0 ? 'success' : 'warning'}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Adjust Stock
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdjustStockForm;