import { Container, Row, Col, Button } from 'react-bootstrap';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import Link from 'next/link';

const AdminLandingPage = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main>
      <Container className="background centered" id="landing-page" fluid>
        <Row>
          <h1 className="text-white">Welcome! please select an action below</h1>
        </Row>
        <Row>
          <Col>
            <Link href="/admin-dashboard">
              <Button className="m-3 same-size-btn">Admin Dashboard</Button>
            </Link>
          </Col>
          <Col>
            <Link href="/add-event">
              <Button className="m-3 same-size-btn">Add Event</Button>
            </Link>
          </Col>
          <Col>
            <Link href="/events">
              <Button className="m-3 same-size-btn">Events</Button>
            </Link>
          </Col>
          {/* <Col>
            <button type="button" className="m-3">
              <a href="/eventsignup">
                Event
                <br />
                Sign-up
              </a>
            </button>
          </Col> */}
        </Row>
      </Container>
    </main>
  );
};

export default AdminLandingPage;
