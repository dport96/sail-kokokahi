'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';
import { GearFill } from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname() || ''; // Provide empty string as fallback

  // Determine if we're on the landing page
  const isLandingPage = pathName === '/';

  // Check if we're on the event-check-in page
  const isEventCheckIn = pathName?.startsWith('/event-check-in') || false;

  // Check if we're on the sign in page
  const isSignInPage = pathName === '/auth/signin';

  // Style based on page
  const navStyle = {
    backgroundColor: isLandingPage ? 'transparent' : 'rgba(0, 0, 0, 0.35)',
    position: isEventCheckIn ? 'relative' : 'absolute',
    width: '100%',
    zIndex: 1000,
    paddingTop: '1rem',
    paddingBottom: '1rem',
    transition: 'background-color 0.3s ease',
    ...(isEventCheckIn && {
      marginBottom: '2rem',
      backgroundColor: 'rgb(154, 152, 152)',
    }),
  } as const;

  return (
    <Navbar
      expand="lg"
      variant="dark"
      style={navStyle}
    >
      <Container>
        <Link href="/" className="navbar-brand text-white">
          SAIL KOKOKAHI
        </Link>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {role === 'ADMIN' && (
              <>
                <Link
                  href="/admin-dashboard"
                  className={`nav-link text-white ${pathName === '/admin-dashboard' ? 'active' : ''}`}
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/add-event"
                  className={`nav-link text-white ${pathName === '/add-event' ? 'active' : ''}`}
                >
                  ADD EVENT
                </Link>
                <Link
                  href="/admin-events"
                  className={`nav-link text-white ${pathName === '/admin-events' ? 'active' : ''}`}
                >
                  EVENTS
                </Link>
                <Link
                  href="/admin-analytics"
                  className={`nav-link text-white ${pathName === '/admin-analytics' ? 'active' : ''}`}
                >
                  ANALYTICS
                </Link>
              </>
            )}
            {role === 'USER' && (
              <>
                <Link
                  href="/member-dashboard"
                  className={`nav-link text-white ${pathName === '/member-dashboard' ? 'active' : ''}`}
                >
                  DASHBOARD
                </Link>
                <Link
                  href="/member-event-sign-up"
                  className={`nav-link text-white ${pathName === '/member-event-sign-up' ? 'active' : ''}`}
                >
                  EVENTS
                </Link>
              </>
            )}
            {currentUser ? (
              <NavDropdown
                title={(
                  <span className="text-white">
                    <GearFill className="me-1" />
                    ACCOUNT
                  </span>
                )}
                id="account-dropdown"
                className="text-white"
              >
                {role === 'USER' && (
                  <NavDropdown.Item as={Link} href="/settings">
                    Settings
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} href="/auth/change-password">
                  Change Password
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} href="/api/auth/signout">
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : null}
            {!currentUser && isSignInPage && (
              <Link href="/" className="nav-link text-white">
                HOME
              </Link>
            )}
            {!currentUser && !isSignInPage && (
              <Link href="/auth/signin" className="nav-link text-white">
                SIGN IN
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
