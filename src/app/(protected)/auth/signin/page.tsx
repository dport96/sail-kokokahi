'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import Link from 'next/link';

/** The sign in page. */
const SignIn = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Redirect immediately if user is already signed in
  React.useEffect(() => {
    if (currentUser && (role === 'USER' || role === 'ADMIN')) {
      setIsRedirecting(true);
      if (role === 'ADMIN') {
        router.push('/admin-dashboard');
      } else {
        router.push('/member-event-sign-up');
      }
    }
  }, [currentUser, role, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setIsLoading(true);
    
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error('Sign in failed: ', result.error);
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    } else if (result?.ok) {
      setIsRedirecting(true);
      // Get the user's role and redirect accordingly
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      const userRole = sessionData?.user?.randomKey;
      
      if (userRole === 'ADMIN') {
        router.push('/admin-dashboard');
      } else {
        router.push('/member-event-sign-up');
      }
    }
  };

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <main>
        <Container>
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Redirecting...</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container>
        {/* Only show the sign-in form if user is not signed in */}
        {!currentUser ? (
          <Row key="signin-form" className="justify-content-center">
            <Col xs={5}>
              <h1 className="text-center fw-bold">Sign In</h1>
              <Card>
                <Card.Body>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <Form method="post" onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail">
                      <Form.Label>Email</Form.Label>
                      <input name="email" type="text" className="form-control" />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <input name="password" type="password" className="form-control" />
                    </Form.Group>
                    <Button type="submit" className="mt-3" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Signing In...
                        </>
                      ) : (
                        'Signin'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
                <Card.Footer>
                  Don&apos;t have an account?
                  {' '}
                  <Link href="/register">Sign up</Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        ) : (
          /* Show nothing while redirecting */
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Redirecting...</p>
          </div>
        )}
      </Container>
    </main>
  );
};

export default SignIn;