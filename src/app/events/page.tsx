import { getServerSession } from 'next-auth';
import { Col, Container, Row, DropdownButton, Image } from 'react-bootstrap';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const EventsPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  const events = await prisma.event.findMany({});

  const sortedEvents = events.sort((a, b) => {
    const dateA = new Date(a.date).getTime(); // Convert MM/DD/YYYY string to Date object
    const dateB = new Date(b.date).getTime(); // Convert MM/DD/YYYY string to Date object
    return dateB - dateA; // Sort by date descending
  });

  return (
    <main>
      <Container>
        <Row>
          <Col>
            <div className="mb-3">
              <h2>Event Sign-up</h2>
              {sortedEvents.map((event) => (
                <Row key={event.id} className="border p-3">
                  <h4>{event.date}</h4>
                  <h5>{event.title}</h5>
                  <Col>
                    <DropdownButton title="Information" variant="light">
                      Time:
                      {' '}
                      {event.time}
                      <br />
                      Potential Hours:
                      {' '}
                      {event.hours}
                      <br />
                      Description:
                      {' '}
                      {event.description}
                      <br />
                    </DropdownButton>
                    <Image src={event.qr} alt="Event QR Code" fluid />
                  </Col>
                </Row>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EventsPage;
