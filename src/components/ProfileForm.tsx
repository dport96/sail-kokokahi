import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
}

const ProfileForm: React.FC = () => {
  const { register, handleSubmit } = useForm<ProfileFormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: ProfileFormData): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Swal('Success!', 'Profile updated successfully.', 'success');
      } else {
        Swal('Error!', 'Failed to update profile.', 'error');
      }
    } catch (error) {
      Swal('Error!', 'An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
      {/* Personal Information Section */}
      <h3>Personal Information</h3>
      <div className="mb-3">
        <label htmlFor="user-first-name" className="form-label">
          First Name
        </label>
        <input
          type="text"
          id="user-first-name"
          className="form-control"
          {...register('firstName', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="user-last-name" className="form-label">
          Last Name
        </label>
        <input
          type="text"
          id="user-last-name"
          className="form-control"
          {...register('lastName', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="user-email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="user-email"
          className="form-control"
          {...register('email', { required: true })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="user-phone" className="form-label">
          Phone
        </label>
        <input
          type="tel"
          id="user-phone"
          className="form-control"
          {...register('phone')}
        />
      </div>

      {/* Payment Information Section */}
      <h3>Payment Information</h3>
      <div className="mb-3">
        <label htmlFor="card-number" className="form-label">
          Card Number
        </label>
        <input
          type="text"
          id="card-number"
          className="form-control"
          {...register('cardNumber')}
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
          {...register('cardExpiry')}
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
          {...register('cardCVV')}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

export default ProfileForm;
