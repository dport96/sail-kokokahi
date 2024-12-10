import { Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';

/** The Home page. */
const Home = () => (
  <main>
    <Container className="background centered" id="landing-page" fluid>
      <Row>
        <h1 className="text-white">Welcome!</h1>
      </Row>
      <Row>
        <Col>
          <h1 className="text-white">Please click below to sign in.</h1>
          <Link href="/auth/signin">
            <Button className="m-3 same-size-btn">Here</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  </main>
);

export default Home;
