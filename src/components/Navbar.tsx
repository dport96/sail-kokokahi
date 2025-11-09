'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { GearFill } from 'react-bootstrap-icons';
import { useState } from 'react';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;
  const pathName = usePathname() || ''; // Provide empty string as fallback

  const handleNavCollapse = () => setExpanded(false);

  const handleSignOut = async () => {
    handleNavCollapse();
    // Get the base URL (protocol + host) without any path
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    await signOut({ callbackUrl: baseUrl });
  };

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
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <a href="/" className="navbar-brand text-white" onClick={handleNavCollapse}>
          SAIL KOKOKAHI
        </a>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {role === 'ADMIN' && (
              <>
                <a
                  href="/admin-dashboard"
                  className={`nav-link text-white ${pathName === '/admin-dashboard' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  DASHBOARD
                </a>
                <a
                  href="/add-event"
                  className={`nav-link text-white ${pathName === '/add-event' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  ADD EVENT
                </a>
                <a
                  href="/admin-events"
                  className={`nav-link text-white ${pathName === '/admin-events' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  EVENTS
                </a>
                <a
                  href="/admin-analytics"
                  className={`nav-link text-white ${pathName === '/admin-analytics' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  ANALYTICS
                </a>
                <a
                  href="/admin-maintenance"
                  className={`nav-link text-white ${pathName === '/admin-maintenance' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  MAINTENANCE
                </a>
              </>
            )}
            {role === 'USER' && (
              <>
                <a
                  href="/member-dashboard"
                  className={`nav-link text-white ${pathName === '/member-dashboard' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  DASHBOARD
                </a>
                <a
                  href="/member-event-sign-up"
                  className={`nav-link text-white ${pathName === '/member-event-sign-up' ? 'active' : ''}`}
                  onClick={handleNavCollapse}
                >
                  EVENTS
                </a>
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
                align="end"
                menuVariant="dark"
              >
                {role === 'USER' && (
                  <NavDropdown.Item href="/settings" onClick={handleNavCollapse}>
                    Settings
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item href="/auth/change-password" onClick={handleNavCollapse}>
                  Change Password
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleSignOut}>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : null}
            {!currentUser && isSignInPage && (
              <a href="/" className="nav-link text-white" onClick={handleNavCollapse}>
                HOME
              </a>
            )}
            {!currentUser && !isSignInPage && (
              <a href="/auth/signin" className="nav-link text-white" onClick={handleNavCollapse}>
                SIGN IN
              </a>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
