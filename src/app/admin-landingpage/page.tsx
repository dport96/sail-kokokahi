import { Container, Row, Col } from 'react-bootstrap';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';

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
            <button type="button" className="m-3">
              <a href="/admin-dashboard">Admin Dashboard</a>
            </button>
          </Col>
          <Col>
            <button type="button" className="m-3">
              <a href="/add-event">Add Event</a>
            </button>
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
