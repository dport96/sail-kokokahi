import { getServerSession } from 'next-auth';
import { Col, Container, Row } from 'react-bootstrap';
import { adminProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import AdminEventsClient from '@/components/AdminEventsClient';

const EventsPage = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  // Get all events and sort by date
  const allEvents = await prisma.event.findMany({
    orderBy: {
      date: 'asc',
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  // Helper function to parse MM/DD/YYYY date format
  const parseEventDate = (dateString: string) => {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JS Date
  };

  // Separate current/upcoming events from past events
  const upcomingEvents = allEvents.filter(event => {
    const eventDate = parseEventDate(event.date);
    eventDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return eventDate >= today;
  });

  const pastEvents = allEvents.filter(event => {
    const eventDate = parseEventDate(event.date);
    eventDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return eventDate < today;
  });

  // Server current date/time (for display)
  const serverNow = new Date();
  const formattedServerNow = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(serverNow);

  return (
    <main>
      <Container>
        <Row>
          <Col>
            <div className="mb-3">
              <h1 className="fw-bold pt-3">Events</h1>
              <div className="text-muted" aria-live="polite">
                <small>
                  Server time:
                  {' '}
                  {formattedServerNow}
                </small>
              </div>
              <hr />
              <AdminEventsClient
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EventsPage;
