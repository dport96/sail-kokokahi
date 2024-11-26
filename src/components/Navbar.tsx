/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill, PersonPlusFill } from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname();

  return (
    <Navbar bg="dark" expand="lg" className="py-4">
      <Container>
      {currentUser && role === 'USER' ? [
        <Navbar.Brand className="text-white" href="/member-landingpage">
        Sail Kokokahi Volunteer Portal
        </Navbar.Brand>,
      ] : ''}
      {currentUser && role === 'ADMIN' ? [
        <Navbar.Brand className="text-white" href="/admin-landingpage">
        Sail Kokokahi Volunteer Portal
        </Navbar.Brand>,
      ] : ''}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{
            backgroundColor: 'white',
            borderRadius: '5px',
          }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser && role === 'USER' && (
              <>
                <Nav.Link
                  className="text-white"
                  id="member-dashboard-nav"
                  href="/member-dashboard"
                  key="member-dashboard"
                  active={pathName === '/member-dashboard'}
                >
                  Member Dashboard
                </Nav.Link>
                <Nav.Link
                  className="text-white"
                  id="event-signup-nav"
                  href="/eventsignup"
                  key="event-signup"
                  active={pathName === '/eventsignup'}
                >
                  Event Sign-Up
                </Nav.Link>
              </>
            )}
            {currentUser && role === 'ADMIN' && (
              <Nav.Link
                className="text-white"
                id="admin-dashboard-nav"
                href="/admin-dashboard"
                key="admin-dashboard"
                active={pathName === '/admin-dashboard'}
              >
                Admin Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {session ? (
              <NavDropdown
                id="login-dropdown"
                title={<span style={{ color: 'white' }}>{currentUser}</span>}
              >
                <NavDropdown.Item id="login-dropdown-sign-out" href="/api/auth/signout">
                  <BoxArrowRight />
                  Sign Out
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock />
                  Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown
                id="login-dropdown"
                title={<span style={{ color: 'white' }}>Login</span>}
              >
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  Sign in
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" href="/register">
                  <PersonPlusFill />
                  Sign up
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
