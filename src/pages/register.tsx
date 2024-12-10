// pages/register.tsx
import React from 'react';
import RegisterForm from '@/components/RegisterForm';

const RegisterPage: React.FC = () => (
  <div className="min-vh-100 d-flex align-items-center bg-light py-5">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold text-primary">Create Account</h2>
            <p className="text-muted lead">Join our community and start tracking your volunteer hours</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  </div>
);

export default RegisterPage;
