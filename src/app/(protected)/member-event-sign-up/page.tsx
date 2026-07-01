import { getServerSession } from 'next-auth';
import { Col, Container, Row } from 'react-bootstrap';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import SignUp from '@/app/(protected)/SignUp';
import { getApplicationSettingsNoCache } from '@/lib/settings';

/** Render a list of stuff for the logged in user. */
const EventsSignUp = async () => {
  // Protect the page, only logged-in users can access it
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as { user: { email: string; id: string; randomKey: string } } | null,
  );

  const userId = Number(session?.user?.id);

  const { TIME_ZONE } = await getApplicationSettingsNoCache();

  const now = new Date();
  const todayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const todayParts = todayFormatter.formatToParts(now);
  const todayMap = new Map(todayParts.map((part) => [part.type, part.value]));
  const today = `${todayMap.get('month')}/${todayMap.get('day')}/${todayMap.get('year')}`;

  // Fetch events from the database
  const events = await prisma.event.findMany({
    orderBy: {
      date: 'asc',
    },
    include: {
      users: Number.isNaN(userId)
        ? false
        : {
          where: {
            userId,
          },
          select: {
            userId: true,
            attended: true,
          },
        },
    },
  });

  const eventsWithSignupStatus = events.map((event) => ({
    ...event,
    isSignedUp: Array.isArray(event.users) && event.users.length > 0,
    isCheckedIn: Array.isArray(event.users) && event.users.some((userEvent) => userEvent.attended),
  }));

  const upcomingEventsOnly = eventsWithSignupStatus.filter((event) => {
    const normalizedEventDate = event.date.trim();
    return normalizedEventDate >= today;
  });

  // Pass the events data as props to the EventsSignUp component
  return (
    <main>
      <Container>
        <Row>
          <Col>
            <SignUp events={upcomingEventsOnly} timeZone={TIME_ZONE} />
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EventsSignUp;
