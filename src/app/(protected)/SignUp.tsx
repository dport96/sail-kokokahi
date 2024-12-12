'use client';

import { Button, Col, DropdownButton, Row } from 'react-bootstrap';
import swal from 'sweetalert';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  hours: number;
  description: string;
}

interface EventsSignUpProps {
  events: Event[];
}

const SignUp = ({ events }: EventsSignUpProps) => {
  const handleSignUp = async (eventId: number) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up for the event');
      }

      const data = await response.json();
      swal(`Successfully signed up for event: ${data.eventId}`);
    } catch (error) {
      console.error(error);
      swal('Error signing up for the event');
    }
  };

  return (
    <div className="mb-3">
      <h2>Event Sign-up</h2>
      {events.map((event) => (
        <Row key={event.id} className="border p-3">
          <h4>{event.date}</h4>
          <h5>{event.title}</h5>
          <Col>
            <DropdownButton title="Information" variant="light">
              Time:
              {' '}
              {event.time}
              <br />
              Potential Hours:
              {' '}
              {event.hours}
              <br />
              Description:
              {' '}
              {event.description}
              <br />
            </DropdownButton>
            <Button onClick={() => handleSignUp(event.id)}>Sign Up</Button>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default SignUp;
