import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import AdminMaintenanceClient from '@/components/AdminMaintenanceClient';

const AdminMaintenancePage = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(session as { user: { email: string; id: string; randomKey: string } } | null);

  return (
    <main>
      <AdminMaintenanceClient />
    </main>
  );
};

export default AdminMaintenancePage;
