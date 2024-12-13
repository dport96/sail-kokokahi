import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import CheckInComponent from '@/components/CheckIn';

const prisma = new PrismaClient();

export default async function EventPage({ params }: { params: { eventId: string } }) {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const { eventId } = params;

  // Extract the date and title from eventId
  const [date, ...titleParts] = eventId.replace(/^EVENT-/, '').split('-');
  const title = titleParts.join(' ');

  const formattedDate = `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`;

  const normalizedTitle = title.replace(/-/g, ' ');
  const event = await prisma.event.findFirst({
    where: {
      date: formattedDate,
      title: normalizedTitle,
    },
  });

  if (!event) {
    return (
      <div>
        <h1>Event Not Found</h1>
      </div>
    );
  }

  return <CheckInComponent event={event} />;
}
