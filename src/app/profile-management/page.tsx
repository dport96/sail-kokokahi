'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  emailNotifications: boolean;
  billingAddress: string;
  creditCard: string;
  expirationDate: string;
  cvv: string;
}

const ProfileManagement: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emailNotifications: true,
    billingAddress: '',
    creditCard: '',
    expirationDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleNotifications = () => {
    setProfile((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }));
  };

  const validate = () => {
    const validationErrors: Record<string, string> = {};
    if (!profile.firstName.trim()) validationErrors.firstName = 'First name is required.';
    if (!profile.lastName.trim()) validationErrors.lastName = 'Last name is required.';
    if (!profile.email.includes('@')) validationErrors.email = 'Invalid email address.';
    if (!profile.phone.match(/^\d{10}$/)) validationErrors.phone = 'Phone number must be 10 digits.';
    if (!profile.creditCard.match(/^\d{16}$/)) validationErrors.creditCard = 'Invalid credit card number.';
    if (!profile.expirationDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      validationErrors.expirationDate = 'Expiration date must be in MM/YY format.';
    }
    if (!profile.cvv.match(/^\d{3}$/)) validationErrors.cvv = 'CVV must be 3 digits.';
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log('Profile Updated:', profile);
  };

  return (
    <Container>
      <h1 className="fw-bold pt-3">Profile Management</h1>
      <hr />
      <Form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="phone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            isInvalid={!!errors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Email Notifications */}
        <Form.Group className="mb-3" controlId="emailNotifications">
          <Form.Check
            type="switch"
            label="Enable Email Notifications"
            checked={profile.emailNotifications}
            onChange={handleToggleNotifications}
          />
        </Form.Group>

        {/* Billing Information */}
        <h2>Billing Information</h2>
        <Form.Group className="mb-3" controlId="billingAddress">
          <Form.Label>Billing Address</Form.Label>
          <Form.Control
            as="textarea"
            name="billingAddress"
            value={profile.billingAddress}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="creditCard">
          <Form.Label>Credit Card Number</Form.Label>
          <Form.Control
            type="text"
            name="creditCard"
            value={profile.creditCard}
            onChange={handleChange}
            isInvalid={!!errors.creditCard}
          />
          <Form.Control.Feedback type="invalid">
            {errors.creditCard}
          </Form.Control.Feedback>
        </Form.Group>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="expirationDate">
              <Form.Label>Expiration Date (MM/YY)</Form.Label>
              <Form.Control
                type="text"
                name="expirationDate"
                value={profile.expirationDate}
                onChange={handleChange}
                isInvalid={!!errors.expirationDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.expirationDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="cvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="text"
                name="cvv"
                value={profile.cvv}
                onChange={handleChange}
                isInvalid={!!errors.cvv}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cvv}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Submit Button */}
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>
    </Container>
  );
};

export default ProfileManagement;
