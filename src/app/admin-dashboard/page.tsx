import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Container } from 'react-bootstrap';
import AdminDashboardClient from '@/components/AdminDashboardClient'; // Import the Client Component

const AdminDashboard = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const users = await prisma.user.findMany({});
  const amount = 120;

  // Pass data to the client component
  const usersWithAmountDue = users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    approvedHours: user.approvedHours,
    amountDue: user.approvedHours > 6 ? 0 : amount - 20 * user.approvedHours,
  }));

  return (
    <main>
      <Container>
        <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
        <hr />
        <AdminDashboardClient users={usersWithAmountDue} />
      </Container>
    </main>
  );
};

export default AdminDashboard;
