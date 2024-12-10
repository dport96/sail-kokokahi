'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const ProfileForm: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<ProfileFormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        reset(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Swal('Error!', 'Failed to load profile data.', 'error');
    }
  }, [reset]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal('Error!', 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Profile Settings</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="user-first-name" className="form-label fw-semibold">First Name</label>
                      <input
                        type="text"
                        id="user-first-name"
                        className="form-control form-control-lg"
                        placeholder="Enter first name"
                        {...register('firstName', { required: true })}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="user-last-name" className="form-label fw-semibold">Last Name</label>
                      <input
                        type="text"
                        id="user-last-name"
                        className="form-control form-control-lg"
                        placeholder="Enter last name"
                        {...register('lastName', { required: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="user-email" className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    id="user-email"
                    className="form-control form-control-lg"
                    placeholder="Enter email address"
                    {...register('email', { required: true })}
                  />
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="user-phone" className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    id="user-phone"
                    className="form-control form-control-lg"
                    placeholder="Enter phone number"
                    {...register('phone')}
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
