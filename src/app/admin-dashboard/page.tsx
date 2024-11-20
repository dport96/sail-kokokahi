import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { Container } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';

const AdminDashboard = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  // Need a way to retrieve the user hours and event history
  const users = await prisma.user.findMany({});
  const amount = 120;
  return (
    <main>
      <Container>
        <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
        <hr />
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
                    {user.approvedHours > 6 ? 0 : amount - (20 * user.approvedHours)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
        <Container>
          <button type="button">
            <a href="/admin-dashboard">Export as CSV</a>
          </button>
        </Container>
      </Container>
    </main>
  );
};

export default AdminDashboard;
