import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { WithdrawMedicineRequest, MedicineBatchDto } from '../../types';

interface WithdrawFormProps {
  batch: MedicineBatchDto;
  onSubmit: (data: WithdrawMedicineRequest) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  batch,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawMedicineRequest>({
    defaultValues: {
      batchId: batch.id,
      quantity: 1,
      reason: '',
      patientReference: '',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: WithdrawMedicineRequest) => {
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
          <p><span className="font-medium">Available:</span> {batch.currentQuantity} units</p>
          <p><span className="font-medium">Expires:</span> {new Date(batch.expiryDate).toLocaleDateString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Quantity to Withdraw *"
          type="number"
          {...register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Must be at least 1' },
            max: { value: batch.currentQuantity, message: `Cannot exceed available quantity (${batch.currentQuantity})` },
          })}
          error={errors.quantity?.message}
          placeholder="Enter quantity"
        />

        <Input
          label="Reason *"
          {...register('reason', { required: 'Reason is required' })}
          error={errors.reason?.message}
          placeholder="e.g., Patient treatment, Emergency use"
        />

        <Input
          label="Patient Reference"
          {...register('patientReference')}
          error={errors.patientReference?.message}
          placeholder="Patient ID or reference number"
        />

        <Input
          label="Notes"
          {...register('notes')}
          error={errors.notes?.message}
          placeholder="Additional notes"
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
            variant="warning"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Withdraw Medicine
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WithdrawForm;