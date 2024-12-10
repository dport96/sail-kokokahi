'use client';

import { useState } from 'react';
import { Button, Col, DropdownButton, Row, Container } from 'react-bootstrap';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  hours: number;
  description: string;
}

export default function CheckInComponent({ event }: { event: Event }) {
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckIn = async (eventId: number) => {
    try {
      const response = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();
      console.log('Response:', result); // Log server response for debugging

      if (response.ok) {
        setMessage('Successfully checked in!');
      } else {
        setMessage(result.message || 'Check-in failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred during check-in.');
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="mb-3">
            <h2>Event Check In</h2>
            <Row className="border p-3">
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
                <Button onClick={() => handleCheckIn(event.id)}>Check In</Button>
              </Col>
            </Row>
          </div>
          {message && <p>{message}</p>}
        </Col>
      </Row>
    </Container>
  );
}
