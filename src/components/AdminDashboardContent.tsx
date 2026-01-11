'use client';

import { Container } from 'react-bootstrap';
import React from 'react';
import CombinedMembersTable from '@/components/CombinedMembersTable';

interface AdminDashboardContentProps {
  usersWithAmountDue: Array<{
    id: number;
    firstName: string;
    lastName: string;
    approvedHours: number;
    pendingHours: number;
    amountDue: number;
    status: string;
    role: string;
    createdAt: Date;
    mustChangePassword?: boolean;
  }>;
  settings: {
    HOURLY_RATE: number;
    MEMBERSHIP_BASE_AMOUNT: number;
    HOURS_REQUIRED: number;
    TIME_ZONE: string;
  };
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ usersWithAmountDue, settings }) => {
  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
      <hr />
      <CombinedMembersTable users={usersWithAmountDue} settings={settings} />
    </Container>
  );
};

export default AdminDashboardContent;
