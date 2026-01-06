import { Container } from 'react-bootstrap';

/** The Home page. */
const Home = () => (
  <main>
    <Container className="background" id="landing-page" fluid>
      {/* Empty container with just the background image */}
    </Container>
    <img
      src="/Sail_Kokokahi_logo.png"
      alt="Sail Kokokahi Logo"
      className="landing-logo"
    />
  </main>
);

export default Home;
