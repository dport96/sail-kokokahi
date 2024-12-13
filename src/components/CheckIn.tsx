'use client';

import { useState } from 'react';
import { Button, Col, DropdownButton, Row, Container } from 'react-bootstrap';
import swal from 'sweetalert';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  hours: number;
  description: string;
}

export default function CheckInComponent({ event }: { event: Event }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async (eventId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();

      if (response.ok) {
        swal('Success', 'Successfully checked in!', 'success');
      } else {
        throw new Error(result.message || 'Check-in failed');
      }
    } catch (error) {
      console.error(error);
      swal('Error', error instanceof Error ? error.message : 'An error occurred during check-in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="mb-3">
            <h1 className="fw-bold pt-3">Event Check In</h1>
            <Row className="border p-3">
              <h4>{event.date}</h4>
              <h5>{event.title}</h5>
              <Col>
                <DropdownButton title="Information" variant="light" className="mb-2">
                  <div className="p-3">
                    <p>
                      Time:
                      {event.time}
                    </p>
                    <p>
                      Potential Hours:
                      {event.hours}
                    </p>
                    <p>
                      Description:
                      {event.description}
                    </p>
                  </div>
                </DropdownButton>
                <Button
                  onClick={() => handleCheckIn(event.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Checking in...' : 'Check In'}
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
