import { Container, Row, Col, Button } from 'react-bootstrap';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { memberProtectedPage } from '@/lib/page-protection';
import Link from 'next/link';

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
            <Link href="/member-dashboard">
              <Button className="m-3 same-size-btn">Member Dashboard</Button>
            </Link>
          </Col>
          <Col>
            <Link href="/eventsignup">
              <Button className="m-3 same-size-btn">Event Sign Up</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default MemberLandingPage;
