import { getServerSession } from 'next-auth';
import { Col, Container, Row, DropdownButton, Image } from 'react-bootstrap';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

/** Render a list of stuff for the logged in user. */
const EventsPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );
  const events = await prisma.event.findMany({});

  // console.log(stuff);
  return (
    <main>
      <Container>
        <Row>
          <Col>
            <div className="mb-3">
              <h2>Event Sign-up</h2>
              {events.map((event) => (
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
