'use client';

import { Table, Button, Badge, Container } from 'react-bootstrap';
import { useState } from 'react';
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
  const [updatedUsers, setUpdatedUsers] = useState(users);
  const [open, setOpen] = React.useState(false);
  const [confirmationText, setConfirmationText] = useState('');

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
    } catch (error) {
      console.error('Error resetting the database:', error);
    }
  };

  const updateApprovedHours = async (userId: number, newHours: number) => {
    const response = await fetch('/api/admin/update-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, approvedHours: newHours }),
    });
    if (response.ok) {
      setUpdatedUsers((prevUsers) => prevUsers.map((user) => (user.id === userId
        ? { ...user, approvedHours: newHours }
        : user)));
    } else {
      console.error('Failed to update approved hours');
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUpdatedUsers((prevUsers) => prevUsers.map((user) => (user.id === userId
          ? { ...user, approvedHours: user.approvedHours + user.pendingHours, pendingHours: 0, status: 'approved' }
          : user)));
        toast.success('Pending hours approved successfully!');
      } else {
        toast.error('Failed to approve hours.');
      }
    } catch (error) {
      toast.error('Error approving hours. Please try again.');
    }
  };

  const handleDeny = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUpdatedUsers((prevUsers) => prevUsers.map((user) => (user.id === userId
          ? { ...user, pendingHours: 0, status: 'denied' }
          : user)));
        toast.success('Pending hours denied successfully!');
      } else {
        toast.error('Failed to deny hours.');
      }
    } catch (error) {
      toast.error('Error denying hours. Please try again.');
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.pendingHours > 0) {
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
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Approved Hours</th>
              <th>Pending Hours</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Delete User</th>
            </tr>
          </thead>
          <tbody>
            {updatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{ float: 'left' }}
                    onClick={async () => {
                      const newHours = user.approvedHours - 0.5;
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
                  <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(user.id)}>
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeny(user.id)}>
                    Deny
                  </Button>
                </td>
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
