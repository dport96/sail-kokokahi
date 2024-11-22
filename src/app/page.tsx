import { Container, Row } from 'react-bootstrap';

/** The Home page. */
const Home = () => (
  <main>
    <Container className="background centered" id="landing-page" fluid>
      <Row>
        <h1 className="text-white">Welcome!</h1>
      </Row>
      <Row>
        <h1 className="text-white">Please click below to sign in.</h1>
        <button type="button" className="m-3">
          <a href="/auth/signin">here</a>
        </button>
      </Row>
    </Container>
  </main>
);

export default Home;
