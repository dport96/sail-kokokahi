import { Container, Row, Col } from 'react-bootstrap';

/** The Home page. */
const Home = () => (
  <main>
    <Container className="background centered" id="landing-page" fluid>
      <Row>
        <h1 className="text-white">Welcome! please select an action below</h1>
      </Row>
      <Row>
        <Col>
          <button type="button" className="m-3">
            <a href="/member-dashboard">Member Dashboard</a>
          </button>
        </Col>
        <Col>
          <button type="button" className="m-3">
            <a href="/eventsignup">
              Event
              <br />
              Sign-up
            </a>
          </button>
        </Col>
      </Row>
    </Container>
  </main>
);

export default Home;
