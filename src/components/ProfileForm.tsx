'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

const ProfileForm: React.FC = () => {
  const { data: session, status } = useSession();
  const { register, handleSubmit, reset } = useForm<ProfileFormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.email) {
      console.log('No session email available');
      return;
    }

    try {
      const response = await fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`);
      console.log('Profile response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        reset(userData);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch profile:', errorData);
        Swal('Error!', 'Failed to load profile data.', 'error');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Swal('Error!', 'Failed to load profile data.', 'error');
    }
  }, [reset, session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [fetchUserProfile, status]);

  const onSubmit = async (data: ProfileFormData): Promise<void> => {
    if (!session?.user?.email) {
      Swal('Error!', 'You must be logged in to update your profile.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: session.user.email, // Ensure we use the email from session
        }),
      });

      if (response.ok) {
        Swal('Success!', 'Profile updated successfully.', 'success');
      } else {
        const errorData = await response.text();
        console.error('Failed to update profile:', errorData);
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal('Error!', 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Please sign in to view your profile.
        </div>
      </div>
    );
  }

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
                    disabled
                    value={session?.user?.email || ''}
                  />
                  <small className="text-muted">Email cannot be changed</small>
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
