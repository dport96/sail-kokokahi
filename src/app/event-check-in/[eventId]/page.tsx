import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import CheckInComponent from '@/components/CheckIn';

const prisma = new PrismaClient();

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  // In Next.js 15+, params is a Promise that needs to be awaited
  const { eventId } = await params;
  
  const session = await getServerSession(authOptions);
  // If there's no session, redirect to the sign-in page and include a callbackUrl
  // that returns the user to this exact event check-in page after authentication.
  if (!session) {
    const base = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
    const callback = `${base}/event-check-in/${eventId}`;
    // Use a full absolute callback URL so NextAuth redirects back correctly.
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  // For authenticated users, run the existing protection checks (authorization)
  // Cast via unknown to satisfy TypeScript when narrowing session to our expected shape
  loggedInProtectedPage(session as unknown as { user: { email: string; id: string; randomKey: string } } | null);

  // Try to resolve event by numeric ID first; fall back to legacy EVENT-<date>-<title> format
  let event = null as Awaited<ReturnType<typeof prisma.event.findUnique>> | null;
  if (/^\d+$/.test(eventId)) {
    event = await prisma.event.findUnique({ where: { id: Number(eventId) } });
  } else {
    // Legacy support: Extract the date and title from legacy identifier
    const cleanedId = eventId.replace(/^EVENT-/, '');
    const parts = cleanedId.split('-');
    const date = parts[0] || '';
    const titleParts = parts.slice(1);
    const title = titleParts.join(' ');

    const formattedDate = date && date.length === 8
      ? `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`
      : '';
    const normalizedTitle = title.replace(/-/g, ' ');

    if (formattedDate && normalizedTitle) {
      event = await prisma.event.findFirst({
        where: {
          date: formattedDate,
          title: normalizedTitle,
        },
      });
    }
  }

  if (!event) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h2 className="alert-heading">Event Not Found</h2>
          <p>The event you&apos;re trying to check in to could not be found.</p>
          <hr />
          <p className="mb-0">
            This could happen if:
          </p>
          <ul>
            <li>The event details have changed</li>
            <li>The QR code is from an old or cancelled event</li>
            <li>The event has been removed from the system</li>
          </ul>
          <p className="mt-3">
            Please contact the event organizer or administrator for assistance.
          </p>
        </div>
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
