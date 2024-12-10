import { getServerSession } from 'next-auth';
import { Col, Container, Row, DropdownButton, Image } from 'react-bootstrap';
import { adminProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { EventList } from '@/components/EventList';

const EventsPage = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const events = await prisma.event.findMany();

  return (
    <main>
      <Container>
        <Row>
          <Col>
            <div className="mb-3">
              <h1 className="fw-bold pt-3">Events</h1>
              <hr />
              <EventList events={events} />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EventsPage;
