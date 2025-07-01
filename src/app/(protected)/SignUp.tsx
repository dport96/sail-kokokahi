'use client';

import { useEffect, useState } from 'react';
import { Button, Col, DropdownButton, Row } from 'react-bootstrap';
import swal from 'sweetalert';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  signupReq: boolean;
  hours: number;
  description: string;
}

interface EventsSignUpProps {
  events: Event[];
}

const SignUp = ({ events }: EventsSignUpProps) => {
  const [eventList, setEventList] = useState<Event[]>([]);

  const handleSignUp = async (eventId: number) => {
    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }), // Pass eventId as a number
      });

      if (!response.ok) {
        throw new Error('Failed to sign up for the event');
      }

      swal('Successfully signed up for the event');
    } catch (error) {
      console.error(error);
      swal('You are already signed up for the event');
    }
  };

  useEffect(() => {
    // Filter out past events
    const now = new Date();
    const filteredEvents = events.filter(
      (event) => new Date(event.date) >= now,
    );
    setEventList(filteredEvents);
  }, [events]);

  const sortedEvents = eventList.sort((a, b) => {
    const dateA = new Date(a.date).getTime(); // Convert MM/DD/YYYY string to Date object
    const dateB = new Date(b.date).getTime(); // Convert MM/DD/YYYY string to Date object
    return dateA - dateB; // Sort by date descending
  });
  return (
    <div className="mb-3">
      <h1 className="fw-bolder pt-3">EVENTS</h1>
      <h6>To check into an event scan the QR code at the event, open up the link, login and click Check In</h6>
      <hr />
      {sortedEvents.map((event) => (
        <Row key={event.id} className="border p-3">
          <h4>{event.date}</h4>
          <h5>{event.title}</h5>
          <Col>

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
            {event.signupReq && (
              <Button onClick={() => handleSignUp(event.id)}>Sign Up</Button>
            )}
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default SignUp;
