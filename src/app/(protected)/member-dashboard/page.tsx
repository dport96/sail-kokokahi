import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { HOURLY_RATE, MEMBERSHIP_BASE_AMOUNT, HOURS_REQUIRED } from '@/lib/constants';

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

  // Get the current user's ID for querying their event history
  const user = users[0];

  // Calculate progress and amount due
  const totalHours = user ? user.approvedHours + user.pendingHours : 0;
  const progressPercentage = Math.min((totalHours / HOURS_REQUIRED) * 100, 100);
  const amountDue = user && user.approvedHours >= HOURS_REQUIRED
    ? 0
    : MEMBERSHIP_BASE_AMOUNT - HOURLY_RATE * (user?.approvedHours || 0);

  // Get all events the user has been credited for (attended events)
  const userAttendedEvents = user ? await prisma.userEvent.findMany({
    where: {
      userId: user.id,
      attended: true,
    },
    include: {
      Event: true,
    },
    orderBy: {
      Event: {
        date: 'desc',
      },
    },
  }) : [];

  // Get the user's hours log for additional details
  const userHoursLog = user ? await prisma.hoursLog.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) : [];

  const formatDate = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: formatDate(new Date()), // Get events that are today or later
      },
    },
    orderBy: {
      date: 'asc',
  },
  });

  // Filter out past events by comparing with today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  return (
    <main>
      <Container>
        <h1 className="fw-bolder pt-3">
          Welcome,
          {' '}
          {user ? `${user.firstName} ${user.lastName}` : 'Member'}
        </h1>
        <h2 className="text-muted">Member Dashboard</h2>
        <hr />

        {/* Progress toward membership requirement */}
        <Container className="my-4">
          <h4>Membership Progress</h4>
          <p className="text-muted">
            Complete
            {' '}
            {HOURS_REQUIRED}
            {' '}
            hours of volunteer service to fulfill your membership requirement
          </p>
          <ProgressBar
            now={progressPercentage}
            label={`${totalHours.toFixed(1)} / ${HOURS_REQUIRED} hours`}
            variant={progressPercentage >= 100 ? 'success' : 'primary'}
            className="mb-2"
            style={{ height: '30px', fontSize: '1rem' }}
          />
          <div className="d-flex justify-content-between">
            <span>
              <strong>Amount Due:</strong>
              {' '}
              $
              {amountDue.toFixed(2)}
            </span>
            {progressPercentage >= 100 && (
              <span className="text-success fw-bold">✓ Requirement Met!</span>
            )}
          </div>
        </Container>

        <Container className="center my-5">
          <Row className="mx-auto px-2">
            <Col className="box py-2">
              Pending Hours
              <hr className="m-2" />
              {users.map(currentUserData => (
                <div key={currentUserData.id}>{currentUserData.pendingHours}</div>
              ))}
            </Col>
            <Col className="m-0 p-0" />
            <Col className="box py-2">
              Approved Hours
              <hr className="m-2" />
              {users.map(currentUserData => (
                <div key={currentUserData.id}>{currentUserData.approvedHours}</div>
              ))}
            </Col>
          </Row>
        </Container>

        <Container className="my-5">
          <h3 className="custom-text">My Event History (Events I&apos;ve Been Credited For):</h3>
          <hr />
          {userAttendedEvents.length > 0 ? (
            <div className="row">
              {userAttendedEvents.map(userEvent => (
                <div key={userEvent.id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{userEvent.Event.title}</h5>
                      <p className="card-text">{userEvent.Event.description}</p>
                      <p className="card-text">
                        <small className="text-muted">
                          Date:
                          {' '}
                          {userEvent.Event.date}
                          {' '}
                          | Time:
                          {' '}
                          {userEvent.Event.time}
                        </small>
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          Location:
                          {' '}
                          {userEvent.Event.location}
                        </small>
                      </p>
                      <span className="badge bg-success">
                        {userEvent.Event.hours}
                        {' '}
                        hour
                        {userEvent.Event.hours !== 1 ? 's' : ''}
                        {' '}
                        credited
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No events credited yet.</p>
          )}
        </Container>

        <Container className="my-5">
          <h3 className="custom-text">Recent Hours Activity:</h3>
          <hr />
          {userHoursLog.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Hours</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {userHoursLog.slice(0, 10).map(log => (
                    <tr key={log.id}>
            <td>{formatDate(new Date(log.createdAt))}</td>
                      <td>{log.action}</td>
                      <td>{log.hours}</td>
                      <td>{log.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No hours activity yet.</p>
          )}
        </Container>

        <Container>
          <h3 className="custom-text">Upcoming Events:</h3>
          <hr />
          {upcomingEvents?.map(event => (
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
