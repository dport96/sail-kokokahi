import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
}

const ProfileForm: React.FC = () => {
  const { register, handleSubmit } = useForm<ProfileFormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: ProfileFormData): Promise<void> => {
    setLoading(true);
    try {
      console.log('Submitting data:', data); // Debug log

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Send the form data
      });

      console.log('API response status:', response.status); // Debug log
      if (response.ok) {
        const responseData = await response.json();
        console.log('Profile updated successfully:', responseData); // Debug log
        Swal('Success!', 'Profile updated successfully.', 'success');
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData); // Debug log
        Swal('Error!', errorData.error || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error('Unexpected error:', error); // Debug log
      Swal('Error!', 'An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
      <div className="mb-3">
        <label htmlFor="user-name" className="form-label">
          Name
        </label>
        <input
          type="text"
          id="user-name"
          className="form-control"
          {...register('name', { required: true })}
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
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

export default ProfileForm;
