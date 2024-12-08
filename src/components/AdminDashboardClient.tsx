'use client';

import { Table, Button, Badge, Container } from 'react-bootstrap';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
              </tr>
            ))}
          </tbody>
        </Table>
        <div style={{ float: 'left' }} className="d-flex justify-content-between align-items-center mt-2 mb-5">
          <Button onClick={exportToExcel}>Export as Excel</Button>
        </div>
        <div style={{ float: 'right' }} className="d-flex justify-content-between align-items-center mt-2 mb-5">
          {updatedUsers.map((user) => (
            <Button
              variant="danger"
              onClick={async () => {
                await databaseReset(user.id);
              }}
            >
              Database Reset
            </Button>
          ))}
        </div>
      </Container>
      <ToastContainer />
    </>
  );
};

export default AdminDashboardClient;
