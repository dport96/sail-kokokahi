'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import swal from 'sweetalert';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  signupReq: boolean;
  hours: number;
  description: string;
  isSignedUp?: boolean;
}

interface EventsSignUpProps {
  events: Event[];
  timeZone?: string;
}

const SignUp = ({ events, timeZone = 'UTC' }: EventsSignUpProps) => {
  const [eventList, setEventList] = useState<Event[]>(events);
  const { data: session } = useSession();

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

      setEventList((prevEvents) => prevEvents.map((event) => (
        event.id === eventId
          ? { ...event, isSignedUp: true }
          : event
      )));
      swal('Successfully signed up for the event');
    } catch (error) {
      console.error(error);
      swal('You are already signed up for the event');
    }
  };

  const handleUnregister = async (eventId: number) => {
    if (!session?.user?.id) {
      swal('Please sign in again to unregister from the event');
      return;
    }

    try {
      const response = await fetch(
        `/api/events/${eventId}/attendees?userId=${Number(session.user.id)}`,
        { method: 'DELETE' },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to unregister from the event');
      }

      setEventList((prevEvents) => prevEvents.map((event) => (
        event.id === eventId
          ? { ...event, isSignedUp: false }
          : event
      )));
      swal('Successfully unregistered from the event');
    } catch (error) {
      console.error(error);
      swal('Failed to unregister from the event');
    }
  };

  // Helper function to parse MM/DD/YYYY date format
  const formatToday = () => {
    const now = new Date();
    const todayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const todayParts = todayFormatter.formatToParts(now);
    const todayMap = new Map(todayParts.map((part) => [part.type, part.value]));
    return `${todayMap.get('month')}/${todayMap.get('day')}/${todayMap.get('year')}`;
  };

  useEffect(() => {
    setEventList(events);
  }, [events]);

  const visibleEvents = eventList.filter((event) => {
    const today = formatToday();
    return event.date.trim() >= today;
  });

  const sortedEvents = [...visibleEvents].sort((a, b) => {
    return a.date.localeCompare(b.date);
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
              event.isSignedUp ? (
                <Button variant="danger" onClick={() => handleUnregister(event.id)}>
                  Unregister
                </Button>
              ) : (
                <Button onClick={() => handleSignUp(event.id)}>Sign Up</Button>
              )
            )}
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default SignUp;
