import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert';

interface PaymentFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
}

interface PaymentFormProps {
  userId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ userId }) => {
  const { register, handleSubmit } = useForm<PaymentFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: PaymentFormData): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      if (response.ok) {
        Swal('Success!', 'Payment information updated successfully.', 'success');
      } else {
        Swal('Error!', 'Failed to update payment information.', 'error');
      }
    } catch (error) {
      Swal('Error!', 'An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
      <div className="mb-3">
        <label htmlFor="card-number" className="form-label">
          Card Number
        </label>
        <input
          type="text"
          id="card-number"
          className="form-control"
          {...register('cardNumber', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="card-expiry" className="form-label">
          Expiry Date (MM/YY)
        </label>
        <input
          type="text"
          id="card-expiry"
          className="form-control"
          {...register('cardExpiry', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="card-cvv" className="form-label">
          CVV
        </label>
        <input
          type="text"
          id="card-cvv"
          className="form-control"
          {...register('cardCVV', { required: true })}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Payment Info'}
      </button>
    </form>
  );
};

export default PaymentForm;
