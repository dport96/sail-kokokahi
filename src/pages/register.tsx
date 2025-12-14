// pages/register.tsx
import React from 'react';
import RegisterForm from '@/app/(protected)/RegisterForm';
import NavBar from '@/components/Navbar';
import '../app/globals.css';

const RegisterPage: React.FC = () => (
  <div className="wrapper">
    <NavBar />
    <main>
      <div
        className="min-vh-100 d-flex align-items-center bg-light"
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
      >
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
    </main>
  </div>
);

export default RegisterPage;
