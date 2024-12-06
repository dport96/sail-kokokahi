import { getServerSession } from 'next-auth';
import { Container, Row, Col } from 'react-bootstrap';
import { Role } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import UserActivityChart from '@/components/UserActivityChart';

const AdminDashboard = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  // Calculate date one year ago
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const users = await prisma.user.findMany({
    where: {
      role: Role.USER,
      createdAt: {
        gte: oneYearAgo, // Only get users created after this date
      },
    },
    orderBy: {
      createdAt: 'asc', // Sort by creation date
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      approvedHours: true,
      pendingHours: true,
      status: true,
      createdAt: true,
      role: true,
    },
  });

  const amount = 120;

  const usersWithAmountDue = users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    approvedHours: user.approvedHours,
    pendingHours: user.pendingHours,
    amountDue: user.approvedHours > 6 ? 0 : amount - 20 * user.approvedHours,
    status: user.status,
  }));

  const chartData = users.map((user) => ({
    name: `${user.firstName} ${user.lastName}`,
    registrationDate: user.createdAt.toLocaleDateString(),
    hours: Number(user.approvedHours) + Number(user.pendingHours),
  }));

  return (
    <main>
      <Container>
        <h1 className="fw-bolder pt-3">Admin Dashboard</h1>
        <hr />
        <Row className="mb-4">
          <Col>
            <UserActivityChart data={chartData} />
          </Col>
        </Row>
        <AdminDashboardClient users={usersWithAmountDue} />
      </Container>
    </main>
  );
};

export default AdminDashboard;
