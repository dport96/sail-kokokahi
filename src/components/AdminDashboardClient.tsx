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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button onClick={exportToExcel}>Export as Excel</Button>
        </div>
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
                <td>{user.approvedHours}</td>
                <td>{user.pendingHours}</td>
                <td>
                  $
                  {user.amountDue}
                </td>
                <td>{getStatusBadge(user)}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleApprove(user.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeny(user.id)}
                  >
                    Deny
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <ToastContainer />
    </>
  );
};

export default AdminDashboardClient;
