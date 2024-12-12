import { getServerSession } from 'next-auth';
import { Col, Container, Row } from 'react-bootstrap';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import SignUp from '@/app/(protected)/SignUp';

/** Render a list of stuff for the logged in user. */
const EventsSignUp = async () => {
  // Protect the page, only logged-in users can access it
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as { user: { email: string; id: string; randomKey: string } } | null,
  );

  // Fetch events from the database
  const events = await prisma.event.findMany();

  // Pass the events data as props to the EventsSignUp component
  return (
    <main>
      <Container>
        <Row>
          <Col>
            <SignUp events={events} />
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default EventsSignUp;
