'use client';

import { Container, Row, Col, Button } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

/** The Home page. */
const Home: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;

  return (
    <main>
      <Container className="background centered" id="landing-page" fluid>
        {currentUser && role === 'USER'
          ? [
            <React.Fragment key="user-role">
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
            </React.Fragment>,
          ]
          : ''}
        {currentUser && role === 'ADMIN'
          ? [
            <React.Fragment key="admin-role">
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
                  <Link href="/admin-events">
                    <Button className="m-3 same-size-btn">Events List</Button>
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
            </React.Fragment>,
          ]
          : ''}
        {role !== 'USER' && role !== 'ADMIN'
          ? [
            <React.Fragment key="guest-role">
              <Row>
                <h1 className="text-white">Welcome!</h1>
              </Row>
              <Row>
                <Col>
                  <h1 className="text-white">Please select an action below.</h1>
                  <Link href="/auth/signin">
                    <Button className="m-3 same-size-btn">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="m-3 same-size-btn">Sign up</Button>
                  </Link>
                </Col>
              </Row>
            </React.Fragment>,
          ]
          : ''}
      </Container>
    </main>
  );
};

export default Home;
