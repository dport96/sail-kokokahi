'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

/** The sign in page. */
const SignIn = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { email: string; randomKey?: string };
  const role = userWithRole?.randomKey;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;
    const result = await signIn('credentials', {
      callbackUrl: '/post-logindirectory',
      email,
      password,
    });

    if (result?.error) {
      console.error('Sign in failed: ', result.error);
    }
  };

  return (
    <main>
      <Container>
        {currentUser && (role === 'USER' || role === 'ADMIN')
          ? [
            <h2 className="text-center mt-5">
              You are already signed in!
              <br />
              <br />
              Please use the navigation bar to go to another page.
            </h2>,
          ]
          : [
            <Row className="justify-content-center">
              <Col xs={5}>
                <h1 className="text-center fw-bold">Sign In</h1>
                <Card>
                  <Card.Body>
                    <Form method="post" onSubmit={handleSubmit}>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email</Form.Label>
                        <input name="email" type="text" className="form-control" />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <input name="password" type="password" className="form-control" />
                      </Form.Group>
                      <Button type="submit" className="mt-3">
                        Signin
                      </Button>
                    </Form>
                  </Card.Body>
                  <Card.Footer>
                    Don&apos;t have an account?
                    <a href="/auth/signup">Sign up</a>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>,
          ]}
      </Container>
    </main>
  );
};

export default SignIn;
