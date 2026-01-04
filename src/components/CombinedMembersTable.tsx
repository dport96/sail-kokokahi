'use client';

import React, { useState, useMemo } from 'react';
import { Table, Button, Badge, Container, Modal, Spinner, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { ProgressBar } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { deleteUser } from '@/lib/dbActions';
import swal from 'sweetalert';
import { HOURS_REQUIRED } from '@/lib/constants';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  approvedHours: number;
  pendingHours: number;
  amountDue: number;
  status: string;
  createdAt: Date;
  mustChangePassword?: boolean;
}

interface CombinedMembersTableProps {
  users: User[];
}

const CombinedMembersTable: React.FC<CombinedMembersTableProps> = ({ users }) => {
  const router = useRouter();
  const [updatedUsers, setUpdatedUsers] = useState(users);
  const [showUserEvents, setShowUserEvents] = useState(false);
  const [userEventsLoading, setUserEventsLoading] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [originalApprovedHours, setOriginalApprovedHours] = useState<Map<number, number>>(
    new Map(users.map(user => [user.id, user.approvedHours])),
  );
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  React.useEffect(() => {
    setUpdatedUsers(users);
    if (originalApprovedHours.size === 0 || originalApprovedHours.size !== users.length) {
      setOriginalApprovedHours(new Map(users.map(user => [user.id, user.approvedHours])));
    }
  }, [users, originalApprovedHours.size]);

  const formatDate = (date: Date) => {
    const mm = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const dd = String(new Date(date).getDate()).padStart(2, '0');
    const yyyy = new Date(date).getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const hasPendingHours = (user: User) => user.pendingHours > 0;
  const hasChangedApprovedHours = (user: User) => {
    const originalHours = originalApprovedHours.get(user.id) || 0;
    return user.approvedHours !== originalHours;
  };

  const getProgressBarVariant = (approvedHours: number, percentage: number): string => {
    if (approvedHours >= HOURS_REQUIRED) return 'success';
    if (percentage >= 50) return 'info';
    return 'warning';
  };

  // Filter and sort
  let filtered = updatedUsers;

  if (filterBy === 'pending') {
    filtered = filtered.filter(u => hasPendingHours(u));
  } else if (filterBy === 'no-pending') {
    filtered = filtered.filter(u => !hasPendingHours(u));
  }

  if (searchQuery) {
    filtered = filtered.filter(u => {
      const hay = `${u.firstName} ${u.lastName}`.toLowerCase();
      return hay.includes(searchQuery.toLowerCase());
    });
  }

  if (sortBy === 'hours-asc') {
    filtered.sort((a, b) => (a.approvedHours + a.pendingHours) - (b.approvedHours + b.pendingHours));
  } else if (sortBy === 'hours-desc') {
    filtered.sort((a, b) => (b.approvedHours + b.pendingHours) - (a.approvedHours + a.pendingHours));
  } else if (sortBy === 'name-asc') {
    filtered.sort((a, b) => {
      if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
      if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
      if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
      if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
      return 0;
    });
  } else if (sortBy === 'name-desc') {
    filtered.sort((a, b) => {
      if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return -1;
      if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return 1;
      if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return -1;
      if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return 1;
      return 0;
    });
  }

  const handleApprove = async (userId: number) => {
    try {
      const user = updatedUsers.find(u => u.id === userId);
      if (!user) return;

      const originalHours = originalApprovedHours.get(userId) || 0;
      const hasManuallyChangedHours = user.approvedHours !== originalHours;

      let response;
      if (hasManuallyChangedHours) {
        response = await fetch('/api/admin/update-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, approvedHours: user.approvedHours }),
        });

        if (!response.ok) {
          throw new Error('Failed to update approved hours');
        }
      }

      if (user.pendingHours > 0) {
        response = await fetch('/api/admin/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to approve pending hours');
        }
      }

      setUpdatedUsers((prevUsers) => prevUsers.map((u) => (u.id === userId
        ? { ...u, approvedHours: u.approvedHours + u.pendingHours, pendingHours: 0, status: 'approved' }
        : u)));

      setOriginalApprovedHours((prevOriginal) => {
        const updatedOriginal = new Map(prevOriginal);
        updatedOriginal.set(userId, user.approvedHours + user.pendingHours);
        return updatedOriginal;
      });

      toast.success('Hours approved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve');
    }
  };

  const handleDeny = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to deny pending hours');

      setUpdatedUsers((prevUsers) => prevUsers.map((u) => (u.id === userId
        ? { ...u, pendingHours: 0, status: 'denied' }
        : u)));

      toast.success('Pending hours denied');
    } catch (error) {
      console.error(error);
      toast.error('Failed to deny');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const confirmed = await swal({
        title: 'Delete member?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        buttons: ['Cancel', 'Delete'],
      });

      if (!confirmed) return;

      await deleteUser(userId);
      setUpdatedUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast.success('Member deleted');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete member');
    }
  };

  const handleHourChange = (userId: number, newValue: number) => {
    setUpdatedUsers(prevUsers =>
      prevUsers.map(u => (u.id === userId ? { ...u, approvedHours: newValue } : u)),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filtered.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleUserSelect = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleApproveSelected = async () => {
    for (const userId of Array.from(selectedUsers)) {
      await handleApprove(userId);
    }
    setSelectedUsers(new Set());
  };

  const handleDenySelected = async () => {
    for (const userId of Array.from(selectedUsers)) {
      await handleDeny(userId);
    }
    setSelectedUsers(new Set());
  };

  const handleExport = () => {
    const exportData = filtered.map(u => ({
      'First Name': u.firstName,
      'Last Name': u.lastName,
      'Approved Hours': u.approvedHours,
      'Pending Hours': u.pendingHours,
      'Total Hours': u.approvedHours + u.pendingHours,
      'Registered': formatDate(u.createdAt),
      Status: u.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `members-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const selectedCount = selectedUsers.size;
  const selectedWithPending = Array.from(selectedUsers).filter(id => {
    const u = updatedUsers.find(user => user.id === id);
    return u && hasPendingHours(u);
  }).length;

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Members</h2>
        <Button variant="success" size="sm" onClick={handleExport}>
          📊 Export
        </Button>
      </div>

      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Search member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Form.Select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="all">All</option>
          <option value="pending">Pending Hours</option>
          <option value="no-pending">No Pending</option>
        </Form.Select>
        <Form.Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="name-asc">Name (A→Z)</option>
          <option value="name-desc">Name (Z→A)</option>
          <option value="hours-asc">Hours (Low→High)</option>
          <option value="hours-desc">Hours (High→Low)</option>
        </Form.Select>
      </div>

      {selectedCount > 0 && (
        <div className="alert alert-info mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              {selectedCount}
              {' '}
              selected (
              {selectedWithPending}
              {' '}
              with pending hours)
            </span>
            <div className="d-flex gap-2">
              {selectedWithPending > 0 && (
                <>
                  <Button size="sm" variant="success" onClick={handleApproveSelected}>
                    Approve All
                  </Button>
                  <Button size="sm" variant="warning" onClick={handleDenySelected}>
                    Deny All
                  </Button>
                </>
              )}
              <Button size="sm" variant="secondary" onClick={() => setSelectedUsers(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedCount === filtered.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Member</th>
              <th>Registered</th>
              <th style={{ minWidth: '300px' }}>Progress</th>
              <th>Approved</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const progressPercentage = Math.min((user.approvedHours / HOURS_REQUIRED) * 100, 100);
              const registrationDate = formatDate(user.createdAt);

              return (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <strong>
                      {user.firstName}
                      {' '}
                      {user.lastName}
                    </strong>
                    {user.mustChangePassword && (
                      <Badge bg="danger" className="ms-2">
                        Must Change Password
                      </Badge>
                    )}
                  </td>
                  <td className="small">{registrationDate}</td>
                  <td>
                    <div style={{ minWidth: '300px' }}>
                      <ProgressBar
                        now={progressPercentage}
                        label={`${user.approvedHours}/${HOURS_REQUIRED} hrs`}
                        variant={getProgressBarVariant(user.approvedHours, progressPercentage)}
                        style={{ height: '24px' }}
                      />
                      <small className="text-muted d-block mt-1">
                        {progressPercentage > 100 ? '100+' : progressPercentage.toFixed(1)}
                        %
                      </small>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={user.approvedHours}
                      onChange={(e) => handleHourChange(user.id, Number(e.target.value))}
                      style={{ width: '60px' }}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td className="text-center">
                    {user.pendingHours > 0 ? (
                      <Badge bg="warning">{user.pendingHours}</Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <Badge
                      bg={
                        user.status === 'approved' ? 'success'
                          : user.status === 'denied' ? 'danger'
                            : 'secondary'
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1" style={{ fontSize: '0.85rem' }}>
                      {hasPendingHours(user) && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(user.id)}
                            title="Approve pending hours"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleDeny(user.id)}
                            title="Deny pending hours"
                          >
                            ✗
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete member"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted py-4">
          {searchQuery ? 'No members found matching your search' : 'No members to display'}
        </div>
      )}

      <ToastContainer />
    </Container>
  );
};

export default CombinedMembersTable;
