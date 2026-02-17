'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
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
  timeZone?: string;
}

const SignUp = ({ events, timeZone = 'UTC' }: EventsSignUpProps) => {
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

  // Helper function to parse MM/DD/YYYY date format
  const parseEventDate = (dateString: string) => {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    // Filter out past events (using configured timezone)
    const now = new Date();
    const todayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const todayParts = todayFormatter.formatToParts(now);
    const todayMap = new Map(todayParts.map(part => [part.type, part.value]));
    const today = new Date(`${todayMap.get('year')}-${todayMap.get('month')}-${todayMap.get('day')}`);
    today.setHours(0, 0, 0, 0);
    
    const filteredEvents = events.filter((event) => {
      const eventDate = parseEventDate(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
    setEventList(filteredEvents);
  }, [events, timeZone]);

  const sortedEvents = eventList.sort((a, b) => {
    const dateA = parseEventDate(a.date).getTime();
    const dateB = parseEventDate(b.date).getTime();
    return dateA - dateB; // Sort by date ascending
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
