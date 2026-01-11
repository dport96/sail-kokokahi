import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { Role } from '@prisma/client';
import { adminProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import { getApplicationSettingsNoCache } from '@/lib/settings';

const AdminDashboard = async () => {
    // Fetch application settings from database (no cache to reflect updates immediately)
    const { HOURLY_RATE, MEMBERSHIP_BASE_AMOUNT, HOURS_REQUIRED, TIME_ZONE } = await getApplicationSettingsNoCache();

  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  // Get the date one year ago from now
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const users = await prisma.user.findMany({
    where: {
      role: Role.USER,
      createdAt: {
        gte: oneYearAgo, // Only get users created after this date
      },
    },
    orderBy: [
      {
        lastName: 'asc',
      },
      {
        firstName: 'asc',
      },
    ],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      approvedHours: true,
      pendingHours: true,
      status: true,
      createdAt: true,
      role: true,
      mustChangePassword: true,
    },
  });

  const usersWithAmountDue = users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    approvedHours: user.approvedHours,
    pendingHours: user.pendingHours,
    amountDue: user.approvedHours >= HOURS_REQUIRED ? 0 : MEMBERSHIP_BASE_AMOUNT - HOURLY_RATE * user.approvedHours,
    createdAt: user.createdAt,
    status: user.status,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
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
        settings={{ HOURLY_RATE, MEMBERSHIP_BASE_AMOUNT, HOURS_REQUIRED, TIME_ZONE }}
      />
    </main>
  );
};

export default AdminDashboard;
