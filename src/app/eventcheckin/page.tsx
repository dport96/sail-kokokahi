import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Barcode from '@/components/Barcode';

const prisma = new PrismaClient();

const EventCheckIn = async () => {
  // Protect the page so only admins can access it
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  // Fetch the events from the database
  const events = await prisma.event.findMany();

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Event Check-in</h1>
      <hr />
      <Row>
        {events.map((event) => (
          <Col key={event.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{event.date}</Card.Subtitle>
                <Card.Text>{event.description}</Card.Text>
                <div>
                  <Barcode />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default EventCheckIn;
