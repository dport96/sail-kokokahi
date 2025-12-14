'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Card, Col, Container, Button, Form, Row } from 'react-bootstrap';
import { useRouter, useSearchParams } from 'next/navigation';
// server-side change happens via /api/auth/change-password
import LoadingSpinner from '@/components/LoadingSpinner';

type ChangePasswordForm = {
  oldpassword?: string;
  password: string;
  confirmPassword: string;
  // acceptTerms: boolean;
};

/** Client-only change password component. */
const ChangePasswordClient = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') ?? null;

  const userWithRole = session?.user as { email: string; randomKey?: string; mustChangePassword?: boolean } | undefined;
  const role = userWithRole?.randomKey;
  const mustChangePassword = userWithRole?.mustChangePassword ?? false;

  // Local state to toggle password visibility
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Create validation schema dynamically based on mustChangePassword flag
  const validationSchema = React.useMemo(() => {
    const schema: any = {
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(40, 'Password must not exceed 40 characters'),
      confirmPassword: Yup.string()
        .required('Confirm Password is required')
        .oneOf([Yup.ref('password'), ''], 'Confirm Password does not match'),
    };

    if (!mustChangePassword) {
      schema.oldpassword = Yup.string().required('Current password is required');
    }

    return Yup.object().shape(schema);
  }, [mustChangePassword]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(validationSchema) as any,
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const requestBody = mustChangePassword
        ? { newPassword: data.password }
        : { oldPassword: data.oldpassword, newPassword: data.password };

      const resp = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        const err = await resp.json();
        await swal('Error', err?.error || 'Failed to change password', 'error');
        return;
      }

      await swal('Password Changed', 'Your password has been changed', 'success', { timer: 2000 });
      reset();

      // Redirect user after password change
      // Priority: callbackUrl (from QR scan) > role-based dashboard
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === 'ADMIN') {
        router.push('/admin-dashboard');
      } else {
        router.push('/member-event-sign-up');
      }
    } catch (error) {
      console.error('Change password error:', error);
      await swal('Error', 'Unexpected error changing password', 'error');
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center fw-bold">Change Password</h1>
            {mustChangePassword && (
              <div className="alert alert-warning text-center">
                You must change your password before continuing.
              </div>
            )}
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  {!mustChangePassword && (
                    <Form.Group className="form-group">
                      <Form.Label>Old Password</Form.Label>
                      <div className="input-group">
                        <input
                          type={showOld ? 'text' : 'password'}
                          {...register('oldpassword')}
                          className={`form-control ${errors.oldpassword ? 'is-invalid' : ''}`}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowOld((v) => !v)}
                          aria-label={showOld ? 'Hide old password' : 'Show old password'}
                        >
                          {showOld ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <div className="invalid-feedback">{errors.oldpassword?.message}</div>
                    </Form.Group>
                  )}

                  <Form.Group className="form-group">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-group">
                      <input
                        type={showNew ? 'text' : 'password'}
                        {...register('password')}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNew((v) => !v)}
                        aria-label={showNew ? 'Hide new password' : 'Show new password'}
                      >
                        {showNew ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Change
                        </Button>
                      </Col>
                      <Col>
                        <Button type="button" onClick={() => reset()} className="btn btn-warning float-right">
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ChangePasswordClient;
