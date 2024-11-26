import { Container, Row, Col } from 'react-bootstrap';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { memberProtectedPage } from '@/lib/page-protection';

/** The Home page. */
const MemberLandingPage = async () => {
  const session = await getServerSession(authOptions);
  memberProtectedPage(
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
              <a href="/member-dashboard">Member Dashboard</a>
            </button>
          </Col>
          <Col>
            <button type="button" className="m-3">
              <a href="/eventsignup">
                Event
                <br />
                Sign-up
              </a>
            </button>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default MemberLandingPage;
