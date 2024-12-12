'use client';

import { Container, Row } from 'react-bootstrap';
import { useSession } from 'next-auth/react';

/** The Home page. */
const LoggedInDirectory: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;

  return (
    <main>
      <Container className="background centered" id="landing-page" fluid>
        {currentUser && role === 'USER'
          ? [
            <p className="text-white">
              Sail Kokokahi Volunteer member
            </p>,
          ]
          : ''}
        {currentUser && role === 'ADMIN'
          ? [
            <p className="text-white">
              Sail Kokokahi Volunteer admin
            </p>,
          ]
          : ''}
        <Row>
          <h1 className="text-white">You&apos;re all set!</h1>
        </Row>
        <Row>
          <h1 className="text-white">Please click a button to continue.</h1>
          <button type="button" className="m-3">
            <a href="/member-landingpage">Member</a>
          </button>
          <button type="button" className="m-3">
            <a href="/admin-landingpage">Admin</a>
          </button>
        </Row>
      </Container>
    </main>
  );
};

export default LoggedInDirectory;
