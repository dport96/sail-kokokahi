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
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ usersWithAmountDue }) => {
  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
      <hr />
      <CombinedMembersTable users={usersWithAmountDue} />
    </Container>
  );
};

export default AdminDashboardContent;
