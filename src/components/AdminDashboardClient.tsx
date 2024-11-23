'use client';

import { Container } from 'react-bootstrap';
import * as XLSX from 'xlsx';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  approvedHours: number;
  amountDue: number;
}

interface AdminDashboardClientProps {
  users: User[];
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({ users }) => {
  // Function to export table data as Excel
  const exportToExcel = () => {
    const data = users.map((user) => ({
      FirstName: user.firstName,
      LastName: user.lastName,
      ApprovedHours: user.approvedHours,
      AmountDue: user.amountDue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Dashboard');
    XLSX.writeFile(workbook, 'Admin_Dashboard.xlsx');
  };

  return (
    <>
      <Container className="center my-5">
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Approved Hours</th>
              <th>Amount Due</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.approvedHours}</td>
                <td>
                  $
                  {user.amountDue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
      <Container>
        <button type="button" onClick={exportToExcel}>
          Export as Excel
        </button>
      </Container>
    </>
  );
};

export default AdminDashboardClient;
