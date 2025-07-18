'use client';

import { Table, Button, Badge, Container } from 'react-bootstrap';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import Modal from '@mui/material/Modal';
import { deleteUser } from '@/lib/dbActions';
import swal from 'sweetalert';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  approvedHours: number;
  pendingHours: number;
  amountDue: number;
  status: string;
}

interface AdminDashboardClientProps {
  users: User[];
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({ users }) => {
  const router = useRouter();
  const [updatedUsers, setUpdatedUsers] = useState(users);
  const [open, setOpen] = React.useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [originalApprovedHours, setOriginalApprovedHours] = useState<Map<number, number>>(
    new Map(users.map(user => [user.id, user.approvedHours])),
  );

  // Only update original hours when component first loads or when changes are actually approved/denied
  React.useEffect(() => {
    setUpdatedUsers(users);
    // Only update original hours if this is the first time we're seeing this data
    // or if the user count has changed (new users added/removed)
    if (originalApprovedHours.size === 0 || originalApprovedHours.size !== users.length) {
      setOriginalApprovedHours(new Map(users.map(user => [user.id, user.approvedHours])));
    }
  }, [users, originalApprovedHours.size]);

  const hasPendingChanges = (user: User) => {
    const originalHours = originalApprovedHours.get(user.id) || 0;
    const hasChangedApprovedHours = user.approvedHours !== originalHours;
    return user.pendingHours > 0 || hasChangedApprovedHours;
  };

  const hasPendingHours = (user: User) => user.pendingHours > 0;

  const hasChangedApprovedHours = (user: User) => {
    const originalHours = originalApprovedHours.get(user.id) || 0;
    return user.approvedHours !== originalHours;
  };

  const getSelectedUsersWithPendingHours = () => (
    updatedUsers.filter((user) => selectedUsers.has(user.id) && hasPendingHours(user))
  );

  const getSelectedUsersWithChangedApprovedHours = () => (
    updatedUsers.filter((user) => selectedUsers.has(user.id) && hasChangedApprovedHours(user))
  );

  const handleUserSelect = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleApprove = async (userId: number, showToast: boolean = true) => {
    try {
      const user = updatedUsers.find(u => u.id === userId);
      if (!user) return;

      const originalHours = originalApprovedHours.get(userId) || 0;
      const hasManuallyChangedHours = user.approvedHours !== originalHours;

      let response;
      if (hasManuallyChangedHours) {
        // If approved hours were manually changed, use the update-hours endpoint first
        response = await fetch('/api/admin/update-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, approvedHours: user.approvedHours }),
        });

        if (!response.ok) {
          throw new Error('Failed to update approved hours');
        }
      }

      // Then approve any pending hours
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

      // Update the UI state
      setUpdatedUsers((prevUsers) => prevUsers.map((u) => (u.id === userId
        ? { ...u, approvedHours: u.approvedHours + u.pendingHours, pendingHours: 0, status: 'approved' }
        : u)));

      // Update original hours to reflect the new approved state
      setOriginalApprovedHours((prevOriginal) => {
        const updatedOriginal = new Map(prevOriginal);
        updatedOriginal.set(userId, user.approvedHours + user.pendingHours);
        return updatedOriginal;
      });

      if (showToast) {
        toast.success('Changes approved successfully!');
        // Refresh the page to get updated data from server
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (error) {
      if (showToast) {
        toast.error('Error approving changes. Please try again.');
      }
      throw error;
    }
  };

  const handleDeny = async (userId: number, showToast: boolean = true) => {
    try {
      const user = updatedUsers.find(u => u.id === userId);
      if (!user) return;

      const originalHours = originalApprovedHours.get(userId) || 0;
      const hasManuallyChangedHours = user.approvedHours !== originalHours;

      // If approved hours were manually changed, revert them to original
      if (hasManuallyChangedHours) {
        setUpdatedUsers((prevUsers) => prevUsers.map((u) => (u.id === userId
          ? { ...u, approvedHours: originalHours }
          : u)));
      }

      // Deny any pending hours
      if (user.pendingHours > 0) {
        const response = await fetch('/api/admin/deny', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to deny pending hours');
        }

        setUpdatedUsers((prevUsers) => prevUsers.map((u) => (u.id === userId
          ? { ...u, pendingHours: 0, status: 'denied' }
          : u)));
      }

      // Update original hours to reflect the current approved hours (reverted if changed)
      setOriginalApprovedHours((prevOriginal) => {
        const updatedOriginal = new Map(prevOriginal);
        updatedOriginal.set(userId, originalHours);
        return updatedOriginal;
      });

      if (showToast) {
        toast.success('Changes denied successfully!');
        // Refresh the page to get updated data from server
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (error) {
      if (showToast) {
        toast.error('Error denying changes. Please try again.');
      }
      throw error;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const usersWithPendingChanges = updatedUsers.filter(user => hasPendingChanges(user));

    if (checked) {
      const pendingUserIds = usersWithPendingChanges.map(user => user.id);
      setSelectedUsers(new Set(pendingUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) {
      toast.warning('Please select users to approve');
      return;
    }

    const confirm = await swal({
      title: 'Bulk Approve',
      text: `Are you sure you want to approve pending hours for ${selectedUsers.size} selected user(s)?`,
      icon: 'warning',
      buttons: ['Cancel', 'Approve'],
    });

    if (confirm) {
      try {
        const approvePromises = Array.from(selectedUsers).map(userId => handleApprove(userId, false));
        await Promise.all(approvePromises);
        setSelectedUsers(new Set());
        toast.success(`Successfully approved ${selectedUsers.size} user(s)`);
        // Refresh the page to get updated data from server
        setTimeout(() => router.refresh(), 1000);
      } catch (error) {
        console.error('Bulk approve error:', error);
        toast.error('Some approvals failed. Please try again.');
      }
    }
  };

  const handleBulkDeny = async () => {
    const usersWithPendingHours = getSelectedUsersWithPendingHours();

    if (usersWithPendingHours.length === 0) {
      toast.warning('Please select users with pending hours to deny');
      return;
    }

    const confirm = await swal({
      title: 'Bulk Deny',
      text: `Are you sure you want to deny pending hours for ${usersWithPendingHours.length} selected user(s)?`,
      icon: 'warning',
      buttons: ['Cancel', 'Deny'],
      dangerMode: true,
    });

    if (confirm) {
      try {
        const denyPromises = usersWithPendingHours.map(user => handleDeny(user.id, false));
        await Promise.all(denyPromises);
        setSelectedUsers(new Set());
        toast.success(`Successfully denied ${usersWithPendingHours.length} user(s)`);
        // Refresh the page to get updated data from server
        setTimeout(() => router.refresh(), 1000);
      } catch (error) {
        console.error('Bulk deny error:', error);
        toast.error('Some denials failed. Please try again.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this users data!',
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await deleteUser(id);
          setUpdatedUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
          swal('Deleted!', 'The user has been deleted successfully.', 'success');
          // Refresh the page to get updated data from server
          setTimeout(() => router.refresh(), 1000);
        } catch (error) {
          console.error('Delete user error:', error);
          swal('Error', 'Failed to delete the user. Please try again.', 'error');
        }
      }
    });
  };

  const exportToExcel = () => {
    const data = updatedUsers.map((user) => ({
      FirstName: user.firstName,
      LastName: user.lastName,
      ApprovedHours: user.approvedHours,
      PendingHours: user.pendingHours,
      AmountDue: user.amountDue,
      Status: user.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Dashboard');
    XLSX.writeFile(workbook, 'Admin_Dashboard.xlsx');
    toast.success('Exported as Excel successfully!');
  };

  const databaseReset = async (userId: number) => {
    const hoursReset = 0;
    const response = await fetch('/api/admin/update-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, approvedHours: hoursReset, pendingHours: hoursReset }),
    });
    if (response.ok) {
      setUpdatedUsers((prevUsers) => prevUsers.map((user) => (user.id === userId
        ? { ...user, approvedHours: hoursReset, pendingHours: hoursReset }
        : user)));
    } else {
      console.error('Failed to update approved hours');
    }
  };

  const handleResetAll = async () => {
    try {
      // Create an array of promises for each user's databaseReset call
      const resetPromises = updatedUsers.map((user) => databaseReset(user.id));

      // Execute all promises concurrently
      await Promise.all(resetPromises);

      console.log('All users reset successfully!');
      // Refresh the page to get updated data from server
      setTimeout(() => router.refresh(), 500);
    } catch (error) {
      console.error('Error resetting the database:', error);
    }
  };

  const updateApprovedHours = async (userId: number, newHours: number) => {
    // Only update the UI state, don't update the database directly
    // This makes the change appear as "pending" until it's approved
    setUpdatedUsers((prevUsers) => prevUsers.map((user) => (user.id === userId
      ? { ...user, approvedHours: newHours }
      : user)));

    // Automatically select the user when approved hours are changed
    setSelectedUsers((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.add(userId);
      return newSelected;
    });

    // Don't update originalApprovedHours here - this keeps the change as "pending"
    // The change will only be committed to the database when approved
  };

  const getStatusBadge = (user: User) => {
    const originalHours = originalApprovedHours.get(user.id) || 0;
    const userHasChangedApprovedHours = user.approvedHours !== originalHours;

    if (user.pendingHours > 0 || userHasChangedApprovedHours) {
      return <Badge bg="warning">Pending</Badge>;
    }
    if (user.status === 'approved') {
      return <Badge bg="success">Approved</Badge>;
    }
    if (user.status === 'denied') {
      return <Badge bg="danger">Denied</Badge>;
    }
    return null;
  };

  return (
    <>
      <Container>
        {/* Bulk Actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={handleBulkApprove}
              disabled={selectedUsers.size === 0}
            >
              Approve Selected (
              {selectedUsers.size}
              )
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDeny}
              disabled={getSelectedUsersWithPendingHours().length === 0}
            >
              Deny Selected (
              {getSelectedUsersWithPendingHours().length}
              )
            </Button>
          </div>
          <div className="text-muted">
            {selectedUsers.size > 0 && (
              <div>
                {selectedUsers.size}
                {' '}
                user(s) selected
                {getSelectedUsersWithPendingHours().length > 0 && (
                  <span className="text-success">
                    {' '}
                    •
                    {' '}
                    {getSelectedUsersWithPendingHours().length}
                    {' '}
                    with pending hours
                  </span>
                )}
                {getSelectedUsersWithChangedApprovedHours().length > 0 && (
                  <span className="text-warning">
                    {' '}
                    •
                    {' '}
                    {getSelectedUsersWithChangedApprovedHours().length}
                    {' '}
                    with changed approved hours
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>
                <label htmlFor="select-all" className="visually-hidden">
                  Select All
                </label>
                <input
                  id="select-all"
                  type="checkbox"
                  checked={(() => {
                    const usersWithPendingChanges = updatedUsers.filter(user => hasPendingChanges(user));
                    return usersWithPendingChanges.length > 0
                           && usersWithPendingChanges.every(user => selectedUsers.has(user.id));
                  })()}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Approved Hours</th>
              <th>Pending Hours</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Delete User</th>
            </tr>
          </thead>
          <tbody>
            {updatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <label htmlFor={`user-${user.id}`} className="visually-hidden">
                    Select
                    {' '}
                    {user.firstName}
                    {' '}
                    {user.lastName}
                  </label>
                  <input
                    id={`user-${user.id}`}
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    disabled={!hasPendingChanges(user)}
                    onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                  />
                </td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{ float: 'left' }}
                    onClick={async () => {
                      const newHours = (user.approvedHours > 0.5) ? (user.approvedHours - 0.5) : 0;
                      await updateApprovedHours(user.id, newHours);
                    }}
                  >
                    -
                  </Button>
                  {user.approvedHours}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{ float: 'right' }}
                    onClick={async () => {
                      const newHours = user.approvedHours + 0.5;
                      await updateApprovedHours(user.id, newHours);
                    }}
                  >
                    +
                  </Button>
                </td>
                <td>{user.pendingHours}</td>
                <td>
                  $
                  {user.amountDue}
                </td>
                <td>{getStatusBadge(user)}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    X
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div style={{ float: 'left' }} className="d-flex justify-content-between align-items-center mt-2 mb-5">
          <Button onClick={exportToExcel}>Export as Excel</Button>
        </div>
        <div style={{ float: 'right' }} className="d-flex justify-content-between align-items-center mt-2 mb-5">
          <Button
            variant="danger"
            onClick={() => setOpen(true)}
          >
            Reset Database
          </Button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <div style={{
              borderRadius: '15px',
              textAlign: 'justify',
              background: 'white',
              padding: '20px',
              margin: '10% auto',
              width: '50%',
              height: 'auto',
            }}
            >
              <h1 className="fw-bold">Reset Database</h1>
              <hr />
              <p className="">
                Are you sure you want to reset the database? This button is expected to only be used on November 31st
                to reset all hours back to zero. Please type
                <i className="fw-bold">&quot;Reset Database&quot; </i>
                and click the button to confirm your reset, then refresh to see changes.
              </p>
              <div className="d-flex flex-column align-items-center mt-4">
                <input
                  type="text"
                  placeholder="Type 'Reset Database' here"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  style={{
                    width: '80%',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                  }}
                />
                <Button
                  variant="danger"
                  disabled={confirmationText !== 'Reset Database'}
                  onClick={async () => {
                    await handleResetAll();
                    setOpen(false);
                    setConfirmationText('');
                  }}
                >
                  Reset Database
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Container>
      <ToastContainer />
    </>
  );
};

export default AdminDashboardClient;
