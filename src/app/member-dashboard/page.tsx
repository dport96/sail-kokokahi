import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container, Row, Col } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';

const MemberDashboard = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  // Need a way to retrieve the user hours and event history
  const currentUser = (session && session.user && session.user.email) || '';
  const users = await prisma.user.findMany({
    where: {
      email: currentUser,
    },
  });
  const events = await prisma.event.findMany({});
  return (
    <main>
      <Container>
        <h1 className="fw-bolder pt-3">Member Dashboard</h1>
        <hr />
        <Container className="center my-5">
          <Row className="mx-auto px-2">
            <Col className="box py-2">
              Pending Hours
              <hr className="m-2" />
              {users.map(user => (
                <div key={user.id}>{user.pendingHours}</div>
              ))}
            </Col>
            <Col className="m-0 p-0" />
            <Col className="box py-2">
              Approved Hours
              <hr className="m-2" />
              {users.map(user => (
                <div key={user.id}>{user.approvedHours}</div>
              ))}
            </Col>
          </Row>
        </Container>
        <Container>
          <p className="custom-text">Event History:</p>
          {events?.map(event => (
            <div key={event.id}>
              {event.date}
              :
              {' '}
              {event.title}
              <br />
              <br />
            </div>
          ))}
        </Container>
      </Container>
    </main>
  );
};

export default MemberDashboard;
