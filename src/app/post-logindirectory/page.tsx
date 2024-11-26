import { Container, Row } from 'react-bootstrap';

/** The Home page. */
const LoggedInDirectory = () => (
  <main>
    <Container className="background centered" id="landing-page" fluid>
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

export default LoggedInDirectory;
