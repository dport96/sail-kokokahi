import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import CheckInComponent from '@/components/CheckIn';

const prisma = new PrismaClient();

export default async function EventPage({ params }: { params: { eventId: string } }) {
  const session = await getServerSession(authOptions);
  // If there's no session, redirect to the sign-in page and include a callbackUrl
  // that returns the user to this exact event check-in page after authentication.
  if (!session) {
    const base = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
    const callback = `${base}/event-check-in/${params.eventId}`;
    // Use a full absolute callback URL so NextAuth redirects back correctly.
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  // For authenticated users, run the existing protection checks (authorization)
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

  // Check if the user is already checked in for this event
  let isAlreadyCheckedIn = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const userEvent = await prisma.userEvent.findUnique({
        where: {
          userId_eventId: { userId: user.id, eventId: event.id },
        },
      });
      isAlreadyCheckedIn = userEvent?.attended || false;
    }
  }

  return <CheckInComponent event={event} isAlreadyCheckedIn={isAlreadyCheckedIn} />;
}
