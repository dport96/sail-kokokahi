'use client';

import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

interface Settings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  language: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'en',
  });

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, language: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings Updated:', settings);
    // Replace with an API call to save settings
  };

  return (
    <Container>
      <h1 className="fw-bold pt-3">Settings</h1>
      <hr />
      <Form onSubmit={handleSubmit}>
        {/* Notifications */}
        <h2>Notifications</h2>
        <Form.Group className="mb-3" controlId="emailNotifications">
          <Form.Check
            type="switch"
            label="Enable Email Notifications"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="smsNotifications">
          <Form.Check
            type="switch"
            label="Enable SMS Notifications"
            checked={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />
        </Form.Group>

        {/* Theme */}
        <h2>Appearance</h2>
        <Form.Group className="mb-3" controlId="darkMode">
          <Form.Check
            type="switch"
            label="Enable Dark Mode"
            checked={settings.darkMode}
            onChange={() => handleToggle('darkMode')}
          />
        </Form.Group>

        {/* Language */}
        <h2>Language Preferences</h2>
        <Form.Group className="mb-3" controlId="language">
          <Form.Label>Preferred Language</Form.Label>
          <Form.Select
            value={settings.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </Form.Select>
        </Form.Group>

        {/* Account Management */}
        <h2>Account Management</h2>
        <Row className="mb-3">
          <Col>
            <Button variant="primary" className="w-100">
              Change Password
            </Button>
          </Col>
          <Col>
            <Button variant="danger" className="w-100">
              Deactivate Account
            </Button>
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

export default SettingsPage;
