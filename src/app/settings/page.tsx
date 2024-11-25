'use client';

import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ProfileForm from '@/components/ProfileForm';
import NotificationSettings from '@/components/NotificationSettings';
import BillingInfo from '@/components/BillingInfo';

const SettingsPage: React.FC = () => {
  const [key, setKey] = useState<string>('profile');

  return (
    <div className="container mt-5">
      <h1 className="text-center">Settings</h1>
      <Tabs
        id="settings-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k || 'profile')}
        className="mt-4"
      >
        <Tab eventKey="profile" title="Profile">
          <ProfileForm />
        </Tab>
        <Tab eventKey="notifications" title="Notifications">
          <NotificationSettings />
        </Tab>
        <Tab eventKey="billing" title="Billing">
          <BillingInfo />
        </Tab>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
