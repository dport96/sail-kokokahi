import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import AdminDashboardContent from '@/components/AdminDashboardContent';

const AdminDashboard = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const users = await prisma.user.findMany({
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
    createdAt: user.createdAt,
    status: user.status,
    role: user.role,
  }));

  if (!users || users.length === 0) {
    return (
      <main>
        <div>No users found</div>
      </main>
    );
  }

  return (
    <main>
      <AdminDashboardContent
        usersWithAmountDue={usersWithAmountDue}
      />
    </main>
  );
};

export default AdminDashboard;
