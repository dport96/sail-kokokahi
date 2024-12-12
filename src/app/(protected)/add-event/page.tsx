import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import AddEventForm from '@/components/AddEventForm';

const AddEvent = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  return (
    <main>
      <AddEventForm />
    </main>
  );
};

export default AddEvent;
