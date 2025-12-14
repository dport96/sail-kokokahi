'use client';

import { useState } from 'react';
import { Container, Button, Card, Form } from 'react-bootstrap';
import React from 'react';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import NewUsersProgress from '@/components/NewUsersProgress';

interface BaseUser {
  id: number;
  firstName: string;
  lastName: string;
  approvedHours: number;
  pendingHours: number;
  status: string;
  role: string;
}

interface TableUser extends BaseUser {
  amountDue: number;
  createdAt: Date;
}

interface AdminDashboardContentProps {
  usersWithAmountDue: TableUser[];
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ usersWithAmountDue }) => {
  // Initialize collapsed by default
  const [showProgress, setShowProgress] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [progressFilter, setProgressFilter] = useState('none');
  const [tableFilter, setTableFilter] = useState('none');
  const [pendingFilter, setPendingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleProgressHeaderClick = () => {
    setShowProgress(!showProgress);
  };

  const handleTableHeaderClick = () => {
    setShowTable(!showTable);
  };

  const filterAndSortUsers = (
    data: TableUser[],
    sortType: string,
    pendingStatus: string = 'all',
  ): TableUser[] => {
    if (!data) return [];

    let filteredData = [...data];

    // First apply pending filter for the users table
    if (pendingStatus === 'pending') {
      filteredData = filteredData.filter(user => user.pendingHours > 0);
    } else if (pendingStatus === 'no-pending') {
      filteredData = filteredData.filter(user => user.pendingHours === 0);
    }

    // Then apply sort
    switch (sortType) {
      case 'hours-asc':
        return filteredData.sort((a, b) => {
          const totalA = a.approvedHours + a.pendingHours;
          const totalB = b.approvedHours + b.pendingHours;
          return totalA - totalB;
        });
      case 'hours-desc':
        return filteredData.sort((a, b) => {
          const totalA = a.approvedHours + a.pendingHours;
          const totalB = b.approvedHours + b.pendingHours;
          return totalB - totalA;
        });
      case 'name-asc':
        return filteredData.sort((a, b) => {
          if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
          if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
          if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
          if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
          return 0;
        });
      case 'name-desc':
        return filteredData.sort((a, b) => {
          if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return -1;
          if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return 1;
          if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return -1;
          if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return 1;
          return 0;
        });
      default:
        return filteredData;
    }
  };

  const filteredProgressUsers = filterAndSortUsers(usersWithAmountDue, progressFilter, 'all');
  // Apply search filter (case-insensitive) before sorting
  const searchedUsers = searchQuery
    ? usersWithAmountDue.filter((u) => {
      const hay = `${u.firstName} ${u.lastName} ${('email' in u ? (u as any).email : '')}`.toLowerCase();
      return hay.includes(searchQuery.toLowerCase());
    })
    : usersWithAmountDue;

  const filteredTableUsers = filterAndSortUsers(searchedUsers, tableFilter, pendingFilter);

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
      <hr />

      {/* New Users Progress Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ width: '100%' }}>
            <button
              type="button"
              onClick={handleProgressHeaderClick}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleProgressHeaderClick();
                }
              }}
              className="btn btn-link text-decoration-none text-dark d-flex align-items-center flex-grow-1"
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0">Member Progress</h5>
            </button>
            <div className="d-flex gap-2" style={{ minWidth: '200px' }}>
              <Form.Select
                size="sm"
                value={progressFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProgressFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="none">Sort by...</option>
                <option value="hours-asc">Hours (Low to High)</option>
                <option value="hours-desc">Hours (High to Low)</option>
                <option value="name-asc">Name (A to Z)</option>
                <option value="name-desc">Name (Z to A)</option>
              </Form.Select>
            </div>
            <Button variant="link" onClick={handleProgressHeaderClick}>
              {showProgress ? '−' : '+'}
            </Button>
          </div>
        </Card.Header>

        {showProgress && (
          <Card.Body>
            <div className="text-muted mb-3" />
            <NewUsersProgress users={filteredProgressUsers} />
          </Card.Body>
        )}
      </Card>

      {/* Users Table Section */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ width: '100%' }}>
            <button
              type="button"
              onClick={handleTableHeaderClick}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTableHeaderClick();
                }
              }}
              className="btn btn-link text-decoration-none text-dark d-flex align-items-center flex-grow-1"
              style={{ cursor: 'pointer' }}
            >
              <h5 className="mb-0 me-3">Members Table</h5>
            </button>
            <div className="d-flex gap-2" style={{ minWidth: '400px' }}>
              <input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control form-control-sm"
                style={{ minWidth: '200px' }}
              />
              <Form.Select
                size="sm"
                value={tableFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTableFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="none">Sort by...</option>
                <option value="hours-asc">Hours (Low to High)</option>
                <option value="hours-desc">Hours (High to Low)</option>
                <option value="name-asc">Name (A to Z)</option>
                <option value="name-desc">Name (Z to A)</option>
              </Form.Select>
              <Form.Select
                size="sm"
                value={pendingFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPendingFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">All Members</option>
                <option value="pending">With Pending Hours</option>
                <option value="no-pending">No Pending Hours</option>
              </Form.Select>
              {/* Maintenance moved to the admin navigation bar to avoid duplication */}
            </div>
            <Button variant="link" onClick={handleTableHeaderClick}>
              {showTable ? '−' : '+'}
            </Button>
          </div>
        </Card.Header>

        {showTable && (
          <Card.Body>
            <AdminDashboardClient users={filteredTableUsers} />
          </Card.Body>
        )}
      </Card>
    </Container>
  );
};

export default AdminDashboardContent;
